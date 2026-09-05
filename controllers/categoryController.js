const TicketCategory = require('../models/TicketCategory');
const Event = require('../models/Event');

// Helper to check event ownership
const checkEventOwnership = async (eventId, userId, next) => {
  const event = await Event.findById(eventId);
  if (!event) {
    const error = new Error('Event not found');
    error.errorCode = 'NOT_FOUND';
    return next(error);
  }
  if (event.organizerId.toString() !== userId) {
    const error = new Error('User not authorized to manage categories for this event');
    error.errorCode = 'FORBIDDEN';
    return next(error);
  }
  return event;
};

// @desc    Create a ticket category
// @route   POST /api/events/:eventId/categories
// @access  Private (Organizer, Event Owner)
const createCategory = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { name, price, quota } = req.body;

    const event = await checkEventOwnership(eventId, req.user.id, next);
    if (!event) return; // Error handled by helper

    const category = await TicketCategory.create({
      eventId,
      name,
      price,
      quota,
    });

    res.status(201).json({
      success: true,
      message: 'Record created successfully',
      data: {
        _id: category._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ticket categories for an event
// @route   GET /api/events/:eventId/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const categories = await TicketCategory.find({ eventId });

    res.status(200).json({
      success: true,
      message: 'Records fetched successfully',
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a ticket category
// @route   PUT /api/categories/:id
// @access  Private (Organizer, Event Owner)
const updateCategory = async (req, res, next) => {
  try {
    const category = await TicketCategory.findById(req.params.id);

    if (!category) {
      res.status(404);
      const error = new Error('Ticket category not found');
      error.errorCode = 'NOT_FOUND';
      return next(error);
    }

    const event = await checkEventOwnership(category.eventId, req.user.id, next);
    if (!event) return;

    // Do not allow updating 'sold' field via this endpoint if needed, but since it's just price/quota/name
    const updatedCategory = await TicketCategory.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        price: req.body.price,
        quota: req.body.quota,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Record updated successfully',
      data: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a ticket category
// @route   DELETE /api/categories/:id
// @access  Private (Organizer, Event Owner)
const deleteCategory = async (req, res, next) => {
  try {
    const category = await TicketCategory.findById(req.params.id);

    if (!category) {
      res.status(404);
      const error = new Error('Ticket category not found');
      error.errorCode = 'NOT_FOUND';
      return next(error);
    }

    const event = await checkEventOwnership(category.eventId, req.user.id, next);
    if (!event) return;

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Record deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
