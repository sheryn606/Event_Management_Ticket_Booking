const Booking = require('../models/Booking');

// @desc    Get attendee booking history
// @route   GET /api/bookings/history
// @access  Private (Attendee)
const getBookingHistory = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      attendeeId: req.user.id,
    })
      .populate('eventId', 'title venue date city')
      .populate('ticketCategoryId', 'name price')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        bookings,
        count: bookings.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBookingHistory,
};