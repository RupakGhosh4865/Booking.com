const express = require('express');
const Slot = require('../models/Slot');
const { authenticateToken } = require('../middleware/auth');
const { validateSlotQuery } = require('../middleware/validation');

const router = express.Router();

// Generate slots for the next 7 days
const generateSlots = async () => {
  const slots = [];
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Generate slots for next 7 days
  for (let day = 0; day < 7; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day);
    
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
      continue;
    }
    
    // Generate 30-minute slots from 9:00 AM to 5:00 PM
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const startAt = new Date(currentDate);
        startAt.setHours(hour, minute, 0, 0);
        
        const endAt = new Date(startAt);
        endAt.setMinutes(endAt.getMinutes() + 30);
        
        // Only create slots that are in the future
        if (startAt > now) {
          slots.push({
            startAt,
            endAt,
            isBooked: false
          });
        }
      }
    }
  }
  
  return slots;
};

// Get available slots
router.get('/slots', authenticateToken, validateSlotQuery, async (req, res) => {
  try {
    const { from, to } = req.query;
    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    // Check if we need to generate slots
    const existingSlots = await Slot.countDocuments({
      startAt: { $gte: fromDate, $lte: toDate }
    });
    
    if (existingSlots === 0) {
      // Generate slots for the requested period
      const slotsToGenerate = await generateSlots();
      
      if (slotsToGenerate.length > 0) {
        await Slot.insertMany(slotsToGenerate, { ordered: false });
      }
    }
    
    // Get all slots in the date range
    const slots = await Slot.find({
      startAt: { $gte: fromDate, $lte: toDate }
    }).sort({ startAt: 1 });
    
    // Get booked slot IDs
    const bookedSlotIds = await Slot.distinct('_id', { isBooked: true });
    
    // Separate available and booked slots
    const availableSlots = slots.filter(slot => !slot.isBooked);
    const bookedSlots = slots.filter(slot => slot.isBooked);
    
    res.json({
      availableSlots,
      bookedSlots,
      total: slots.length,
      available: availableSlots.length,
      booked: bookedSlots.length
    });
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({
      error: {
        code: 'SLOTS_ERROR',
        message: 'Failed to fetch available slots'
      }
    });
  }
});

// Initialize slots (admin only)
router.post('/slots/initialize', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: {
          code: 'ADMIN_REQUIRED',
          message: 'Admin access required'
        }
      });
    }
    
    // Generate and save slots
    const slots = await generateSlots();
    
    if (slots.length > 0) {
      await Slot.insertMany(slots, { ordered: false });
    }
    
    res.json({
      message: 'Slots initialized successfully',
      count: slots.length
    });
  } catch (error) {
    console.error('Error initializing slots:', error);
    res.status(500).json({
      error: {
        code: 'INIT_ERROR',
        message: 'Failed to initialize slots'
      }
    });
  }
});

module.exports = router;
