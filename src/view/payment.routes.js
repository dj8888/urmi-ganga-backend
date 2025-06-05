import express from 'express';
//import { createOrder } from '../controllers/payment.controller.js';
import { createOrder, verifyOrder, handlePaymentWebhook, } from '../controllers/payment.controller.js';

const router = express.Router();

router.post('/createOrder', createOrder);
router.post('/verifyOrder', verifyOrder);
// Route for Cashfree webhooks - **MUST BE PUBLICALLY ACCESSIBLE BY CASHFREE**
// This route receives POST requests from Cashfree servers.
// *** This has a special body parser in the index.js as it needs raw body of the request. *** 
// It should **NOT** have standard authMiddleware here, security is via Cashfree signature.
router.post('/cashfree-webhook', handlePaymentWebhook);


export default router;
