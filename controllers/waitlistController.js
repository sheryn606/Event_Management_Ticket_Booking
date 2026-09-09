const Waitlist = require('../models/Waitlist');
const Event = require('../models/Event');
const TicketCategory = require('../models/TicketCategory');

// @desc    Join waitlist
// @route   POST /api/waitlist
// @access  Private (Attendee)
const addToWaitlist = async (req, res, next) => {
  try {
    const { eventId, ticketCategoryId } = req.body;

    // Validate event
    const event = await Event.findById(eventId);
    if (!event || event.status !== 'approved') {
      res.status(404);
      const error = new Error('Event not found or not approved');
      error.errorCode = 'NOT_FOUND';
      return next(error);
    }

    // Validate category
    const category = await TicketCategory.findOne({ _id: ticketCategoryId, eventId });
    if (!category) {
      res.status(404);
      const error = new Error('Ticket category not found for this event');
      error.errorCode = 'NOT_FOUND';
      return next(error);
    }

    // Check duplicate
    const existing = await Waitlist.findOne({
      attendeeId: req.user.id,
      eventId,
      ticketCategoryId,
      status: 'waiting'
    });

    if (existing) {
      res.status(400);
      const error = new Error('Already on waitlist for this category');
      error.errorCode = 'DUPLICATE_ENTRY';
      return next(error);
    }

    const waitlist = await Waitlist.create({
      attendeeId: req.user.id,
      eventId,
      ticketCategoryId,
    });

    res.status(201).json({
      success: true,
      message: 'Added to waitlist successfully',
      data: waitlist,
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      const err = new Error('Already on waitlist for this category');
      err.errorCode = 'DUPLICATE_ENTRY';
      return next(err);
    }
    next(error);
  }
};

// @desc    Get my waitlist entries
// @route   GET /api/waitlist
// @access  Private (Attendee)
const getMyWaitlist = async (req, res, next) => {
  try {
    const waitlist = await Waitlist.find({ attendeeId: req.user.id })
      .populate('eventId', 'title venue date city')
      .populate('ticketCategoryId', 'name price')
      .sort({ requestedAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        waitlist,
        count: waitlist.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addToWaitlist,
  getMyWaitlist,
};
