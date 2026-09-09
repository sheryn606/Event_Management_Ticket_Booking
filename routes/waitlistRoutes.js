const express = require('express');
const router = express.Router();
const { addToWaitlist, getMyWaitlist } = require('../controllers/waitlistController');
const { protect, requireRole } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const waitlistValidation = [
  body('eventId').notEmpty().withMessage('eventId is required').isMongoId().withMessage('Invalid eventId format'),
  body('ticketCategoryId').notEmpty().withMessage('ticketCategoryId is required').isMongoId().withMessage('Invalid ticketCategoryId format'),
];

router.use(protect);
router.use(requireRole('attendee'));

router.post('/', waitlistValidation, validate, addToWaitlist);
router.get('/', getMyWaitlist);

module.exports = router;
