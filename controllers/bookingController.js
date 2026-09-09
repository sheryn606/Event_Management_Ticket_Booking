const crypto = require('crypto');
const QRCode = require('qrcode');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const TicketCategory = require('../models/TicketCategory');

const generateReferenceCode = () => {
  return `EVT-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private (Any authenticated user - acts as attendee)
exports.createBooking = async (req, res, next) => {
  try {
    const { eventId, ticketCategoryId, quantity } = req.body;
    const attendeeId = req.user.id; 

    if (req.user.role !== 'attendee') {
      res.status(403);
      const error = new Error('Only attendees can create bookings');
      error.errorCode = 'FORBIDDEN';
      return next(error);
    }
    // 1. Fetch Event
    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404);
      const error = new Error('Event not found');
      error.errorCode = 'NOT_FOUND';
      return next(error);
    }

    if (event.status !== 'approved') {
      res.status(400);
      const error = new Error('Cannot book tickets for an unapproved event');
      error.errorCode = 'EVENT_NOT_APPROVED';
      return next(error);
    }

    if (new Date(event.date) < new Date()) {
      res.status(400);
      const error = new Error('Cannot book tickets for an event that has already passed');
      error.errorCode = 'EVENT_PASSED';
      return next(error);
    }

    // 2. Fetch Ticket Category
    const category = await TicketCategory.findById(ticketCategoryId);
    if (!category) {
      res.status(404);
      const error = new Error('Ticket category not found');
      error.errorCode = 'NOT_FOUND';
      return next(error);
    }

    if (category.eventId.toString() !== eventId) {
      res.status(409); 
      const error = new Error('Ticket category does not belong to this event');
      error.errorCode = 'CATEGORY_MISMATCH';
      return next(error);
    }

    // 3. Atomically Decrement Inventory (increment 'sold')
    const updateResult = await TicketCategory.updateOne(
      {
        _id: ticketCategoryId,
        $expr: { $lte: [{ $add: ['$sold', quantity] }, '$quota'] }
      },
      { $inc: { sold: quantity } }
    );

    if (updateResult.modifiedCount === 0) {
      res.status(409);
      const error = new Error('Tickets sold out or insufficient inventory');
      error.errorCode = 'TICKETS_SOLD_OUT';
      return next(error);
    }

    // 4. Create Booking
    const unitPrice = category.price;
    const totalAmount = unitPrice * quantity;
    let referenceCode;
    let bookingCreated = false;
    let newBooking;
    
    // Attempt to save booking, retrying if duplicate referenceCode collision
    for (let attempts = 0; attempts < 3; attempts++) {
      referenceCode = generateReferenceCode();
      try {
        newBooking = await Booking.create({
          eventId,
          ticketCategoryId,
          attendeeId,
          quantity,
          unitPrice,
          totalAmount,
          referenceCode,
          status: 'confirmed'
        });
        bookingCreated = true;
        break; // Success!
      } catch (err) {
        if (err.code === 11000 && err.keyPattern && err.keyPattern.referenceCode) {
          // Collision, retry
          continue;
        }
        // Other error, break and let the catch block below handle it
        console.error("Error creating booking document:", err);
        break;
      }
    }

    // If booking creation failed, compensate inventory
    if (!bookingCreated) {
      await TicketCategory.updateOne(
        { _id: ticketCategoryId },
        { $inc: { sold: -quantity } }
      );
      res.status(500);
      const error = new Error('Failed to create booking, inventory restored');
      error.errorCode = 'BOOKING_CREATION_FAILED';
      return next(error);
    }

    // 5. Generate QR Code for Reference
    let qrCode = null;
    try {
      qrCode = await QRCode.toDataURL(referenceCode);
    } catch (qrErr) {
      console.error('QR Generation failed', qrErr);
    }

    res.status(201).json({
      success: true,
      data: {
        booking: newBooking,
        referenceCode: newBooking.referenceCode,
        qrCode
      }
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('eventId', 'title date venue city')
      .populate('ticketCategoryId', 'name');

    if (!booking) {
      res.status(404);
      const error = new Error('Booking not found');
      error.errorCode = 'NOT_FOUND';
      return next(error);
    }

    // Authorization: Attendee can view own, Organizer can view if they own event, Admin can view any
    if (req.user.role === 'attendee' && booking.attendeeId.toString() !== req.user.id) {
      res.status(403);
      const error = new Error('Not authorized to view this booking');
      error.errorCode = 'FORBIDDEN';
      return next(error);
    }

    if (req.user.role === 'organizer') {
      const event = await Event.findById(booking.eventId);
      if (!event || event.organizerId.toString() !== req.user.id) {
        res.status(403);
        const error = new Error('Not authorized to view bookings for this event');
        error.errorCode = 'FORBIDDEN';
        return next(error);
      }
    }

    // Generate QR for convenience
    let qrCode = null;
    try {
      qrCode = await QRCode.toDataURL(booking.referenceCode);
    } catch (qrErr) {}

    res.status(200).json({
      success: true,
      data: {
        booking,
        qrCode
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get booking by Reference Code
// @route   GET /api/bookings/reference/:referenceCode
// @access  Private (Organizer/Admin)
exports.getBookingByReference = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ referenceCode: req.params.referenceCode })
      .populate('eventId', 'title date venue city organizerId')
      .populate('ticketCategoryId', 'name');

    if (!booking) {
      res.status(404);
      const error = new Error('Booking not found');
      error.errorCode = 'NOT_FOUND';
      return next(error);
    }

    // Authorization: Organizer can view if they own event, Admin can view any
    if (req.user.role === 'organizer') {
      if (booking.eventId.organizerId.toString() !== req.user.id) {
        res.status(403);
        const error = new Error('Not authorized to view bookings for this event');
        error.errorCode = 'FORBIDDEN';
        return next(error);
      }
    }

    if (req.user.role === 'attendee') {
      if (booking.attendeeId.toString() !== req.user.id) {
        res.status(403);
        const error = new Error('Not authorized to view this booking');
        error.errorCode = 'FORBIDDEN';
        return next(error);
      }
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Attendee owns booking)
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404);
      const error = new Error('Booking not found');
      error.errorCode = 'NOT_FOUND';
      return next(error);
    }

    // Auth
    if (booking.attendeeId.toString() !== req.user.id) {
      res.status(403);
      const error = new Error('Not authorized to cancel this booking');
      error.errorCode = 'FORBIDDEN';
      return next(error);
    }

    if (booking.status === 'cancelled') {
      res.status(409);
      const error = new Error('Booking is already cancelled');
      error.errorCode = 'ALREADY_CANCELLED';
      return next(error);
    }
    
    if (booking.status === 'checked_in') {
      res.status(409);
      const error = new Error('Cannot cancel a checked-in booking');
      error.errorCode = 'ALREADY_CHECKED_IN';
      return next(error);
    }

    // Time window logic
    const event = await Event.findById(booking.eventId);
    if (!event) {
      res.status(404);
      const error = new Error('Associated event not found');
      error.errorCode = 'NOT_FOUND';
      return next(error);
    }

    const cancellationWindowHours = parseInt(process.env.CANCELLATION_WINDOW_HOURS || '24', 10);
    const windowMs = cancellationWindowHours * 60 * 60 * 1000;
    const eventTime = new Date(event.date).getTime();
    const now = Date.now();

    if (eventTime - now < windowMs) {
      res.status(409);
      const error = new Error(`Cancellation must be requested at least ${cancellationWindowHours} hours before the event`);
      error.errorCode = 'CANCELLATION_WINDOW_PASSED';
      return next(error);
    }

    // Perform Cancellation (State Transition)
    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.refundStatus = 'refunded'; // Simulated refund
    booking.refundAmount = booking.totalAmount;
    await booking.save();

    // Restore Inventory
    await TicketCategory.updateOne(
      { _id: booking.ticketCategoryId },
      { $inc: { sold: -booking.quantity } }
    );

    // Simple Waitlist Promotion (without overengineering)
    try {
      const Waitlist = require('../models/Waitlist');
      const nextInLine = await Waitlist.findOne({
        eventId: booking.eventId,
        ticketCategoryId: booking.ticketCategoryId,
        status: 'waiting'
      }).sort({ requestedAt: 1 });

      if (nextInLine) {
        nextInLine.status = 'promoted';
        await nextInLine.save();
      }
    } catch (promoErr) {
      console.error('Waitlist promotion error:', promoErr);
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully and refund initiated',
      data: booking
    });

  } catch (err) {
    next(err);
  }
};

// @desc    Check-in a booking
// @route   PUT /api/bookings/:id/checkin
// @access  Private (Organizer/Admin)
exports.checkInBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404);
      const error = new Error('Booking not found');
      error.errorCode = 'NOT_FOUND';
      return next(error);
    }

    // Authorization
    if (req.user.role === 'attendee') {
      res.status(403);
      const error = new Error('Attendees cannot perform check-in');
      error.errorCode = 'FORBIDDEN';
      return next(error);
    }

    if (req.user.role === 'organizer') {
      const event = await Event.findById(booking.eventId);
      if (!event || event.organizerId.toString() !== req.user.id) {
        res.status(403);
        const error = new Error('Not authorized to check in bookings for this event');
        error.errorCode = 'FORBIDDEN';
        return next(error);
      }
    }

    if (booking.status === 'checked_in') {
      res.status(409);
      const error = new Error('Booking is already checked in');
      error.errorCode = 'ALREADY_CHECKED_IN';
      return next(error);
    }

    if (booking.status === 'cancelled') {
      res.status(409);
      const error = new Error('Cannot check in a cancelled booking');
      error.errorCode = 'BOOKING_CANCELLED';
      return next(error);
    }

    booking.status = 'checked_in';
    booking.checkedInAt = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Check-in successful',
      data: booking
    });

  } catch (err) {
    next(err);
  }
};
