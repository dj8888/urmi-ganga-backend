import express from 'express';
import {
    addBooking,
    getAllBookings,
    getBookingById,
    updateBooking,
    deleteBooking,
} from '../controllers/booking.controller.js';

const router = express.Router();

router.post('/', addBooking);
router.get('/', getAllBookings);
router.get('/:bookingId', getBookingById);
router.put('/:bookingId', updateBooking);
router.delete('/:bookingId', deleteBooking);

export default router;
