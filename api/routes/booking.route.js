// api/routes/booking.route.js
import express from 'express';
import {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  cancelBooking,
} from '../controllers/booking.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Booking route error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Admin middleware for checking admin privileges
const requireAdmin = (req, res, next) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin verification'
    });
  }
};

// 🔒 Authenticated user routes - These are for regular users
router.post('/create', verifyToken, createBooking);
router.get('/my-bookings', verifyToken, getMyBookings);
router.delete('/:id', verifyToken, cancelBooking);

// 🔒 User-specific routes - Added for compatibility with your frontend
router.get('/user/my-bookings', verifyToken, getMyBookings);
router.post('/user/create', verifyToken, createBooking);
router.put('/user/:id', verifyToken, cancelBooking); // Users can only cancel their bookings

// 🛡️ Admin-only routes - These require admin privileges
router.get('/admin/bookings', verifyToken, requireAdmin, getAllBookings);
router.get('/all', verifyToken, requireAdmin, getAllBookings);
router.get('/admin', verifyToken, requireAdmin, getAllBookings);

// Admin booking management routes
router.put('/:id/status', verifyToken, requireAdmin, updateBookingStatus);
router.put('/:id', verifyToken, requireAdmin, updateBookingStatus);
router.put('/admin/:id/status', verifyToken, requireAdmin, updateBookingStatus);

export default router;