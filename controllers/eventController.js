const Event = require('../models/Event');

// @desc    Create an event
// @route   POST /api/events
// @access  Private (Organizer)
const createEvent = async (req, res, next) => {
  try {
    const { title, description, venue, date, city, category, status } = req.body;

    const event = await Event.create({
      organizerId: req.user.id, // Derived from JWT, not body
      title,
      description,
      venue,
      date,
      city,
      category,
      status: status || 'pending', // Default to pending if not provided
    });

    res.status(201).json({
      success: true,
      message: 'Record created successfully',
      data: {
        _id: event._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Organizer)
const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404);
      const error = new Error('Event not found');
      error.errorCode = 'NOT_FOUND';
      return next(error);
    }

    // Enforce ownership
    if (event.organizerId.toString() !== req.user.id) {
      res.status(403);
      const error = new Error('User not authorized to update this event');
      error.errorCode = 'FORBIDDEN';
      return next(error);
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Record updated successfully',
      data: updatedEvent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Organizer)
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404);
      const error = new Error('Event not found');
      error.errorCode = 'NOT_FOUND';
      return next(error);
    }

    // Enforce ownership
    if (event.organizerId.toString() !== req.user.id) {
      res.status(403);
      const error = new Error('User not authorized to delete this event');
      error.errorCode = 'FORBIDDEN';
      return next(error);
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Record deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404);
      const error = new Error('Event not found');
      error.errorCode = 'NOT_FOUND';
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: 'Record fetched successfully',
      data: event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search/Browse events
// @route   GET /api/events/search
// @access  Public
const searchEvents = async (req, res, next) => {
  try {
    const { category, city, date, page = 1, limit = 10 } = req.query;

    const query = { status: 'approved' };

    if (category) query.category = category;
    if (city) query.city = city;
    if (date) {
      // Basic date match, expecting YYYY-MM-DD
      const searchDate = new Date(date);
      const nextDate = new Date(searchDate);
      nextDate.setDate(nextDate.getDate() + 1);
      
      query.date = {
        $gte: searchDate,
        $lt: nextDate,
      };
    }

    const skip = (page - 1) * limit;

    const events = await Event.find(query)
      .sort({ date: 1 }) // Soonest upcoming first
      .skip(Number(skip))
      .limit(Number(limit));

    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Records fetched successfully',
      data: {
        events,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
        }
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  updateEvent,
  deleteEvent,
  getEvent,
  searchEvents,
};
