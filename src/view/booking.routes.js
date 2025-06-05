import express from 'express';
// Import authentication middleware
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminAuthMiddleware } from '../middleware/adminAuth.middleware.js';

import {
    initiateBooking,
    manualBookingUpdate,
    getBookingDetailsById,
    getAllBookings,
    getUserBookings,
    cancelPendingBookingByUser,
} from '../controllers/booking.controller.js';

const router = express.Router();

//Routes with params should be placed after routes without one.
//user facing routes
router.post('/initiate-booking', authMiddleware, initiateBooking); // Route for initiating a user booking (requires general authentication)
router.get('/my-bookings', authMiddleware, getUserBookings);


//Admin facing routes
router.get('/getAllBookings', adminAuthMiddleware, getAllBookings);

//user facing routes with params
router.get('/:bookingId', authMiddleware, getBookingDetailsById);
router.put('/:bookingId/cancel-pending', authMiddleware, cancelPendingBookingByUser);

//Admin facing routes with params
router.put('/:bookingId/manual-update', adminAuthMiddleware, manualBookingUpdate);

export default router;
