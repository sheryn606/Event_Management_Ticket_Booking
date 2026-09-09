const express = require('express');
const router = express.Router();

const {
  createBooking,
  getBooking,
  getBookingByReference,
  cancelBooking,
  checkInBooking,
} = require('../controllers/bookingController');

const {
  getBookingHistory,
} = require('../controllers/bookingHistoryController');
const { protect, requireRole } = require('../middleware/auth');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const createBookingValidation = [
  body('eventId').notEmpty().withMessage('eventId is required').isMongoId().withMessage('Invalid eventId format'),
  body('ticketCategoryId').notEmpty().withMessage('ticketCategoryId is required').isMongoId().withMessage('Invalid ticketCategoryId format'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer greater than 0'),
];

router.use(protect);
router.get('/history', requireRole('attendee'), getBookingHistory);
router.get('/reference/:referenceCode', getBookingByReference);
router.post('/', createBookingValidation, validate, createBooking);
router.get('/:id', getBooking);
router.put('/:id/cancel', cancelBooking);
router.put('/:id/checkin', checkInBooking);

module.exports = router;
