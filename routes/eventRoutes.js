const express = require('express');
const router = express.Router();
const {
  createEvent,
  updateEvent,
  deleteEvent,
  getEvent,
  searchEvents,
} = require('../controllers/eventController');
const { protect, requireRole } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

// Category routes will be mounted in server.js or handled here. 
// For cleaner organization, they are typically a separate file mounted on /api/events/:eventId/categories
// We'll use a separate router and merge params for category.

// Validation rules
const eventValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('venue').notEmpty().withMessage('Venue is required'),
  body('date').isISO8601().toDate().withMessage('Valid date is required')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Date must be in the future');
      }
      return true;
    }),
  body('city').notEmpty().withMessage('City is required'),
  body('category').notEmpty().withMessage('Category is required'),
];

// Public search must be defined BEFORE /:id to avoid "search" being treated as an ID
router.get('/search', searchEvents);

// Public get single event
router.get('/:id', getEvent);

// Protected routes (Organizer only)
router.use(protect);
router.use(requireRole('organizer'));

router.post('/', eventValidation, validate, createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

module.exports = router;
