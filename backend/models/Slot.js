const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  startAt: {
    type: Date,
    required: [true, 'Start time is required'],
    index: true
  },
  endAt: {
    type: Date,
    required: [true, 'End time is required'],
    index: true
  },
  isBooked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index to ensure unique time slots
slotSchema.index({ startAt: 1, endAt: 1 }, { unique: true });

// Virtual for formatted time display
slotSchema.virtual('formattedTime').get(function() {
  const start = new Date(this.startAt);
  const end = new Date(this.endAt);
  
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };
  
  return `${formatTime(start)} - ${formatTime(end)}`;
});

// Virtual for formatted date display
slotSchema.virtual('formattedDate').get(function() {
  return new Date(this.startAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Ensure virtuals are included when converting to JSON
slotSchema.set('toJSON', { virtuals: true });
slotSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Slot', slotSchema);
