const express = require('express');
const Booking = require('../models/Booking');
const Slot = require('../models/Slot');
const { authenticateToken, requireAdmin, requirePatient } = require('../middleware/auth');
const { validateBooking } = require('../middleware/validation');

const router = express.Router();

// Book a slot
router.post('/book', authenticateToken, requirePatient, validateBooking, async (req, res) => {
  try {
    const { slotId } = req.body;
    const userId = req.user._id;

    // Check if slot exists and is available
    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({
        error: {
          code: 'SLOT_NOT_FOUND',
          message: 'Slot not found'
        }
      });
    }

    if (slot.isBooked) {
      return res.status(400).json({
        error: {
          code: 'SLOT_TAKEN',
          message: 'This slot is already booked'
        }
      });
    }

    // Check if slot is in the past
    if (new Date(slot.startAt) <= new Date()) {
      return res.status(400).json({
        error: {
          code: 'SLOT_EXPIRED',
          message: 'Cannot book a slot in the past'
        }
      });
    }

    // Use transaction to ensure atomicity
    const session = await Booking.startSession();
    session.startTransaction();

    try {
      // Check if slot is still available (double-check)
      const updatedSlot = await Slot.findByIdAndUpdate(
        slotId,
        { isBooked: true },
        { new: true, session }
      );

      if (!updatedSlot || updatedSlot.isBooked === false) {
        throw new Error('Slot is no longer available');
      }

      // Create booking
      const booking = new Booking({
        userId,
        slotId,
        status: 'confirmed'
      });

      await booking.save({ session });

      await session.commitTransaction();

      // Populate booking with user and slot details
      await booking.populate(['user', 'slot']);

      res.status(201).json({
        message: 'Booking created successfully',
        booking: {
          id: booking._id,
          slot: {
            id: booking.slot._id,
            startAt: booking.slot.startAt,
            endAt: booking.slot.endAt,
            formattedTime: booking.slot.formattedTime,
            formattedDate: booking.slot.formattedDate
          },
          status: booking.status,
          createdAt: booking.createdAt
        }
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Booking error:', error);
    
    if (error.message === 'Slot is no longer available') {
      return res.status(400).json({
        error: {
          code: 'SLOT_TAKEN',
          message: 'This slot is no longer available'
        }
      });
    }

    res.status(500).json({
      error: {
        code: 'BOOKING_ERROR',
        message: 'Failed to create booking'
      }
    });
  }
});

// Get user's bookings (patient only)
router.get('/my-bookings', authenticateToken, requirePatient, async (req, res) => {
  try {
    const userId = req.user._id;

    const bookings = await Booking.find({ userId })
      .populate({
        path: 'slot',
        select: 'startAt endAt formattedTime formattedDate'
      })
      .sort({ createdAt: -1 });

    const formattedBookings = bookings.map(booking => ({
      id: booking._id,
      slot: {
        id: booking.slot._id,
        startAt: booking.slot.startAt,
        endAt: booking.slot.endAt,
        formattedTime: booking.slot.formattedTime,
        formattedDate: booking.slot.formattedDate
      },
      status: booking.status,
      createdAt: booking.createdAt
    }));

    res.json({
      bookings: formattedBookings,
      count: formattedBookings.length
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({
      error: {
        code: 'BOOKINGS_ERROR',
        message: 'Failed to fetch bookings'
      }
    });
  }
});

// Get all bookings (admin only)
router.get('/all-bookings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({
        path: 'user',
        select: 'name email'
      })
      .populate({
        path: 'slot',
        select: 'startAt endAt formattedTime formattedDate'
      })
      .sort({ createdAt: -1 });

    const formattedBookings = bookings.map(booking => ({
      id: booking._id,
      user: {
        id: booking.user._id,
        name: booking.user.name,
        email: booking.user.email
      },
      slot: {
        id: booking.slot._id,
        startAt: booking.slot.startAt,
        endAt: booking.slot.endAt,
        formattedTime: booking.slot.formattedTime,
        formattedDate: booking.slot.formattedDate
      },
      status: booking.status,
      createdAt: booking.createdAt
    }));

    res.json({
      bookings: formattedBookings,
      count: formattedBookings.length
    });
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({
      error: {
        code: 'BOOKINGS_ERROR',
        message: 'Failed to fetch bookings'
      }
    });
  }
});

module.exports = router;
