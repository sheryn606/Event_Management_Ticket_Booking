const Booking = require('../models/Booking');
const Event = require('../models/Event');

// @desc    Get organizer dashboard
// @route   GET /api/organizers/:id/dashboard
// @access  Private (Organizer/Admin)
const getDashboard = async (req, res, next) => {
  try {
    const organizerId = req.params.id;

    // Authorization
    if (req.user.role === 'organizer' && req.user.id !== organizerId) {
      res.status(403);
      const error = new Error('Not authorized to access this dashboard');
      error.errorCode = 'FORBIDDEN';
      return next(error);
    }

    // Get all events for this organizer
    const events = await Event.find({ organizerId });
    const eventIds = events.map(e => e._id);

    // Get all bookings for these events
    const bookings = await Booking.find({ eventId: { $in: eventIds } });

    let totalBookings = 0;
    let ticketsSold = 0;
    let revenue = 0;
    let confirmedBookings = 0;
    let cancelledBookings = 0;
    let checkedInBookings = 0;

    const eventSummaries = {};

    events.forEach(e => {
      eventSummaries[e._id] = {
        title: e.title,
        ticketsSold: 0,
        revenue: 0,
      };
    });

    bookings.forEach(b => {
      totalBookings++;
      if (b.status === 'cancelled') {
        cancelledBookings++;
      } else {
        // confirmed or checked_in
        ticketsSold += b.quantity;
        revenue += b.totalAmount;
        if (b.status === 'confirmed') confirmedBookings++;
        if (b.status === 'checked_in') checkedInBookings++;

        if (eventSummaries[b.eventId]) {
          eventSummaries[b.eventId].ticketsSold += b.quantity;
          eventSummaries[b.eventId].revenue += b.totalAmount;
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        ticketsSold,
        revenue,
        confirmedBookings,
        cancelledBookings,
        checkedInBookings,
        eventSummaries: Object.values(eventSummaries),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
};
