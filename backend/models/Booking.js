const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
    required: [true, 'Slot ID is required'],
    unique: true // Prevents double booking
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed'
  }
}, {
  timestamps: true
});

// Compound index for user bookings
bookingSchema.index({ userId: 1, createdAt: -1 });

// Virtual for populated data
bookingSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

bookingSchema.virtual('slot', {
  ref: 'Slot',
  localField: 'slotId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtuals are included when converting to JSON
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Booking', bookingSchema);
