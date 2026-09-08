const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
    index: true,
  },
  ticketCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TicketCategory',
    required: true,
    index: true,
  },
  attendeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  referenceCode: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'checked_in'],
    default: 'confirmed',
    index: true,
  },
  checkedInAt: {
    type: Date,
  },
  cancelledAt: {
    type: Date,
  },
  refundAmount: {
    type: Number,
    default: 0,
  },
  refundStatus: {
    type: String,
    enum: ['not_applicable', 'pending', 'refunded'],
    default: 'not_applicable',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Booking', bookingSchema);
