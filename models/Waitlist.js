const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  attendeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
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
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['waiting', 'promoted', 'expired'],
    default: 'waiting',
  }
}, {
  timestamps: true,
});

// Prevent duplicate entries
waitlistSchema.index({ attendeeId: 1, eventId: 1, ticketCategoryId: 1 }, { unique: true });

module.exports = mongoose.model('Waitlist', waitlistSchema);
