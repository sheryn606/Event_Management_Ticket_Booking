const Event = require('../models/Event');

// @desc    Create an event
// @route   POST /api/events
// @access  Private (Organizer)
const createEvent = async (req, res, next) => {
  try {
    const { title, description, venue, date, city, category } = req.body;

    const event = await Event.create({
      organizerId: req.user.id, // Derived from JWT, not body
      title,
      description,
      venue,
      date,
      city,
      category,
      status: 'pending', // Default to pending if not provided
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

    // Prevent organizer from changing status
    const updateData = { ...req.body };
    delete updateData.status;

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
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
const approveEvent = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      const error = new Error('Status must be approved or rejected');
      error.errorCode = 'VALIDATION_ERROR';
      res.status(400);
      return next(error);
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      const error = new Error('Event not found');
      error.errorCode = 'NOT_FOUND';
      res.status(404);
      return next(error);
    }

    if (event.status !== 'pending') {
      const error = new Error(
        `Event is already ${event.status} and cannot be reviewed`
      );
      error.errorCode = 'INVALID_STATE';
      res.status(409);
      return next(error);
    }

    event.status = status;
    await event.save();

    res.status(200).json({
      success: true,
      message: `Event ${status} successfully`,
      data: {
        _id: event._id,
        status: event.status,
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
  approveEvent,
};
