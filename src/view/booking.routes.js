import express from 'express';
// Import authentication middleware
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { adminAuthMiddleware } from '../../middleware/adminAuth.middleware.js'; // Assuming you have this

import {
    initiateBooking,
} from '../controllers/booking.controller.js';

const router = express.Router();

// Route for initiating a user booking (requires general authentication)
router.post('/initiate-booking', authMiddleware, initiateBooking);

export default router;
