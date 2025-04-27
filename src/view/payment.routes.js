import express from 'express';
//import { createOrder } from '../controllers/payment.controller.js';
import { createOrder, verifyOrder } from '../controllers/payment.controller.js';

const router = express.Router();

router.get('/createOrder', createOrder);
router.post('/verifyOrder', verifyOrder);

export default router;
