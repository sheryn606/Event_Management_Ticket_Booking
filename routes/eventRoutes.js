const express = require('express');

const router = express.Router();

const {
  createEvent,
  updateEvent,
  deleteEvent,
  getEvent,
  searchEvents,
  approveEvent,
} = require('../controllers/eventController');

const { eventCategoryRouter } = require('./categoryRoutes');
const { protect, requireRole } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

// Validation rules
const eventValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('venue').notEmpty().withMessage('Venue is required'),
  body('date')
    .isISO8601()
    .toDate()
    .withMessage('Valid date is required')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Date must be in the future');
      }
      return true;
    }),
  body('city').notEmpty().withMessage('City is required'),
  body('category').notEmpty().withMessage('Category is required'),
];

// Public search
router.get('/search', searchEvents);

// Public ticket categories for an event
router.use('/:eventId/categories', eventCategoryRouter);

// Public get single event
router.get('/:id', getEvent);

// Protected routes
router.use(protect);

// Admin-only event approval
router.put(
  '/:id/approve',
  requireRole('admin'),
  approveEvent
);

// Organizer-only event management
router.use(requireRole('organizer'));

router.post('/', eventValidation, validate, createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

module.exports = router;