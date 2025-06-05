import { Cashfree } from "cashfree-pg";
import dotenv from 'dotenv';
dotenv.config(); // This loads the environment variables from .env
import { customAlphabet } from 'nanoid';

import { sequelize } from "../config/db.js";

if (!process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET || !process.env.CASHFREE_ENVIRONMENT || !process.env.CASHFREE_WEBHOOK_SECRET || !process.env.CASHFREE_WEBHOOK_URL) {
    console.error("Missing Cashfree environment variables! Please check your .env file.");
    // In a production environment, you might want to stop the server startup if these are missing.
    // For development, just a warning might be okay.
    // process.exit(1); // Uncomment this in production build process if needed
}

// var cashfree = new Cashfree(Cashfree.SANDBOX, process.env.CASHFREE_CLIENT_ID, process.env.CASHFREE_CLIENT_SECRET);
//Cashfree.PRODUCTION;
// Configure Cashfree credentials and environment using environment variables
const cashfree = new Cashfree(
    process.env.CASHFREE_ENVIRONMENT === 'PRODUCTION' ? Cashfree.PRODUCTION : Cashfree.TEST, // Use Environment enum
    process.env.CASHFREE_CLIENT_ID,
    process.env.CASHFREE_CLIENT_SECRET
);

const generateOrderId = () => {
    // Define the alphabet
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    // Create a custom generator with a defined length
    const nanoid = customAlphabet(alphabet, 16); // Length is set to 16
    return nanoid(); // Generates a unique ID
}

const createOrder = async (req, res) => {
    // Get necessary data from the frontend request body
    // This data should come from the response of the initiateBooking call
    const { booking_id, plot_id, customer_details, order_meta } = req.body;

    // Basic validation to ensure required data is present
    if (!booking_id || !plot_id || !customer_details || !order_meta) {
        return res.status(400).json({ error: "Missing required data for Cashfree order creation." });
    }

    // Also ensure critical nested details are present
    if (!customer_details.customer_id || !customer_details.customer_phone || !order_meta.return_url) {
        return res.status(400).json({ error: "Missing required customer or order meta details." });
    }

    try {
        // --- Security Step (Recommended): Verify booking and plot details from DB ---
        // Fetch the booking and plot records to verify details and get the correct amount
        const booking = await sequelize.models.Booking.findByPk(booking_id);
        const plot = await sequelize.models.Plot.findByPk(plot_id);

        if (!booking || !plot) {
            console.error(`Create Order: Booking ${booking_id} or Plot ${plot_id} not found.`);
            // If booking initiation was successful, but createOrder fails, the plot might stay blocked.
            // Relying on the timeout for this might be acceptable for now.
            return res.status(404).json({ error: "Booking or Plot not found for order creation." });
        }

        // Use the minimum booking amount from the backend's plot data for security
        const order_amount = plot.minimumBookingAmount;

        const orderId = `order_${generateOrderId()}`; // Generate a unique order ID
        var request = {
            "order_amount": order_amount,
            "order_currency": "INR",
            "order_id": orderId,
            // "customer_details": {
            //     "customer_id": "walterwNrcMi",
            //     "customer_phone": "9999999999"
            // },
            "customer_details": customer_details,
            "order_meta": {
                ...order_meta,
                // "return_url": "https://www.cashfree.com/devstudio/preview/pg/web/checkout?order_id={order_id}"
                //This key holds metadata related to the order. In this case, it includes return_url, which specifies the URL to redirect the user after completing the payment process.
                notify_url: process.env.CASHFREE_WEBHOOK_URL + "/api/payments/cashfree-webhook", // **Crucial:** Your backend webhook URL

                // Pass internal IDs for easy lookup in webhook using UDF fields (User Defined Fields)
                // Convert IDs to string as UDF fields are usually strings
                // udf1: booking_id ? booking_id.toString() : '',
                // udf2: plot_id ? plot_id.toString() : '',
                // udf3: customer_details?.customer_id || '', // Example: pass Clerk User ID from customer details
            },
        }

        // console.log("request object for create order request:", request);

        // --- Update Booking Status to indicate payment is in progress ---
        // Set the paymentStatus to 'in_progress' before calling Cashfree API
        await booking.update({ paymentStatus: 'in_progress' });

        cashfree.PGCreateOrder(request)
            .then(async (response) => {
                // var a = response.data;
                // console.log('Order Created successfully:', a)
                // res.json(a);
                const orderData = response.data; // This object contains order_id, payment_session_id etc.
                console.log('Cashfree Order Created successfully:', orderData);

                // --- Update Booking Record with Cashfree Order ID ---
                // This links your internal booking to the Cashfree order
                await booking.update({
                    paymentId: orderData.order_id, // Store Cashfree order_id in your Booking model's paymentId field
                    // You could also set paymentMethod here if you know it's Cashfree
                    // paymentMethod: 'Cashfree',
                });

                // --- Send Response to Frontend ---
                // The frontend needs payment_session_id to open the Cashfree checkout modal
                res.status(200).json(orderData); // Send the data received directly from Cashfree
            })
            .catch(async (error) => { // <--- ADD 'async' here
                console.error('Error creating Cashfree order:', error.response ? error.response.data : error.message);

                // --- Update Booking Status on Failure ---
                await booking.update({
                    paymentStatus: 'failed',
                    bookingOutcome: 'initial_booking_failed'
                });

                res.status(error.response ? error.response.status : 500).json({
                    error: 'Failed to create Cashfree order.',
                    details: error.response ? error.response.data : error.message,
                });
            });
    }
    catch (error) {
        console.error('Error setting up order request:', error.response.data.message);
    }
}

// const verifyOrder = async (req, res) => {
//     try {
//         console.log(req.body);
//         let { orderID } = req.body;
//         console.log(orderID);
//         //cashfree.PGFetchOrder
//         //cashfree.PGOrderFetchPayments(cashfree.XApiVersion, "order_q7plHDB33k83UfW4").then(response =>
//         cashfree.PGFetchOrder(orderID).then((response) => {
//             res.json(response.data)
//             console.log("response success")
//         }).catch((error) => {
//             console.log(error);
//             console.log("response fail")
//         });
//     } catch (error) {
//         console.log(error);
//     }
// }
// Controller function to verify order status with Cashfree
// Called by the frontend after checkout modal closes or redirect
const verifyOrder = async (req, res) => {
    // Expects orderID (the Cashfree order ID) from the frontend request body
    const { orderID } = req.body;

    // Basic validation
    if (!orderID) {
        return res.status(400).json({ error: "Cashfree Order ID is required for verification." });
    }

    try {
        console.log(`Verifying Cashfree Order ID: ${orderID}`);

        // --- Call Cashfree API to Fetch Order Details ---
        // Use the 'cashfree' instance initialized at the top of the file
        const response = await cashfree.PGFetchOrder(orderID);

        const orderDetails = response.data; // This object contains all order details from Cashfree
        console.log('Cashfree Fetch Order Response:', orderDetails);

        // --- Send Response to Frontend ---
        // Return the order details received directly from Cashfree to the frontend
        res.status(200).json(orderDetails);

    } catch (error) {
        console.error('Error verifying Cashfree order:', error.response ? error.response.data : error.message);

        // Send an error response to the frontend if verification fails
        res.status(error.response ? error.response.status : 500).json({
            error: 'Failed to verify Cashfree order status.',
            details: error.response ? error.response.data : error.message,
        });
    }
};

// Controller function to handle Cashfree payment webhooks
const handlePaymentWebhook = async (req, res) => {
    // Ensure you are using express.raw({ type: 'application/json' }) middleware for this route
    // in src/view/payment.routes.js to get the raw body.
    // console.log(req);

    // console.log("Webhook Headers:", req.headers);
    // console.log("Raw Payload:", req.body.toString()); // Ensure raw body is correctly formatted
    // console.log("Timestamp:", req.headers["x-webhook-timestamp"]);
    // console.log("Received Signature:", req.headers["x-webhook-signature"]);
    // console.log("Raw Body for Signature:", req.body.toString());

    const signature = req.headers["x-webhook-signature"]; // Get signature from header
    const timestamp = req.headers["x-webhook-timestamp"]; // Get timestamp from header
    // req.body should be the raw buffer if using express.raw() middleware
    const rawBody = req.body; // Get the raw request body (Buffer)

    // console.log("Cashfree Webhook Received Headers:", { signature, timestamp });
    // console.log("Cashfree Webhook Received Raw Body:", rawBody ? rawBody.toString() : 'empty'); // Log raw body if needed for debugging

    // --- 1. Verify Webhook Authenticity using Cashfree SDK ---
    // This is a CRUCIAL security step
    if (!signature || !timestamp || !rawBody) {
        console.error("Webhook: Missing signature, timestamp, or raw body.");
        // Return 400 Bad Request if essential data is missing
        return res.status(400).send('Missing signature, timestamp, or raw body');
    }

    try {
        // Use the Cashfree SDK's built-in verification method
        const isSignatureValid = cashfree.PGVerifyWebhookSignature(
            signature,
            rawBody, // Pass the raw body (Buffer)
            timestamp
        );

        if (!isSignatureValid) {
            console.error("Webhook: Signature verification failed!");
            // Return 401 Unauthorized if signature is invalid
            return res.status(401).send('Signature verification failed');
        }
        console.log("Webhook: Signature verified using SDK.");

        // Now that the signature is verified, you can safely parse the raw body
        let webhookData;
        try {
            webhookData = JSON.parse(rawBody.toString()); // Parse the raw body string
            // console.log(webhookData);
        } catch (e) {
            console.error("Webhook: Failed to parse raw body as JSON after verification:", e);
            return res.status(400).send('Invalid JSON payload');
        }


        console.log("pm object", webhookData.data?.payment?.payment_method);
        // --- 2. Extract and Process Webhook Data ---
        // Continue with extracting data from the parsed webhookData object
        const eventType = webhookData.type; // e.g., "ORDER_CREATED", "PAYMENT_SUCCESS"
        const orderStatus = webhookData.data?.payment?.payment_status; // e.g., "PAID", "FAILED"
        const orderId = webhookData.data?.order?.order_id; // Cashfree order ID
        const paymentId = webhookData.data?.payment?.cf_payment_id; // Cashfree payment ID
        const paymentMethod = webhookData.data?.payment?.payment_group; // Payment method used
        const paymentAmount = webhookData.data?.payment?.order_amount; // Amount paid

        // Extract internal IDs from UDF fields
        // const bookingId = webhookData.data?.order?.order_meta?.udf1;
        // const plotId = webhookData.data?.order?.order_meta?.udf2;
        // const customerClerkId = webhookData.data?.order?.order_meta?.udf3; // Example: Clerk User ID

        // console.log("Webhook Data Summary:", { eventType, orderStatus, orderId, paymentId, bookingId, plotId });
        console.log("Webhook Data Summary:", { eventType, orderStatus, orderId, paymentId });

        // Ensure we have the critical internal IDs and Cashfree Order ID/Status
        if (!orderId || !orderStatus) {
            console.error("Webhook: Missing critical internal IDs or Cashfree Order ID/Status in payload.");
            return res.status(400).send('Missing critical data in payload');
        }


        // --- 3. Update Booking and Plot Status based on orderStatus ---
        // ... continue with your existing logic for updating DB status ...
        // Use a transaction here as before
        const t = await sequelize.transaction();

        try {
            // // Find the corresponding Booking and Plot records
            // const booking = await sequelize.models.Booking.findByPk(bookingId, { transaction: t });
            // const plot = await sequelize.models.Plot.findByPk(plotId, { transaction: t });
            //
            // if (!booking || !plot) {
            //     console.error(`Webhook: Booking (<span class="math-inline">\{bookingId\}\) or Plot \(</span>{plotId}) not found in DB.`);
            //     await t.rollback();
            //     return res.status(200).send('Booking or Plot not found internally, status not updated.');
            // }

            // Find the corresponding Booking record using the Cashfree orderId
            const booking = await sequelize.models.Booking.findOne({
                where: { paymentId: orderId }, // Assuming you stored Cashfree order_id in Booking's paymentId field
                include: [{ model: sequelize.models.Plot }], // Include the associated Plot
                transaction: t,
                // lock: t.LOCK.UPDATE // Acquire a lock on the row for the duration of the transaction
                lock: { level: t.LOCK.UPDATE, of: sequelize.models.Booking } // Acquire a lock on the row for the duration of the transaction
            });

            if (!booking) {
                console.warn(`Webhook: Booking with Cashfree Order ID ${orderId} not found in DB. (Might be an old/irrelevant webhook)`);
                await t.rollback();
                // Respond 200 OK to Cashfree even if internal booking not found, so Cashfree doesn't retry.
                return res.status(200).send('Booking not found internally, no update needed.');
            }

            // --- Check if Booking is Already in a Final State ---
            // Define your final statuses based on your Booking model ENUM
            const finalStatuses = ['successful', 'failed', 'cancelled', 'refunded', 'lapsed', 'sale_failed']; // Adjust based on your ENUM

            if (finalStatuses.includes(booking.paymentStatus)) {
                console.log(`Webhook: Booking ${booking.booking_id} (Order ID ${orderId}) is already in final status "${booking.paymentStatus}". Duplicate webhook?`);
                await t.rollback(); // Rollback the transaction
                // Respond 200 OK as the status is already processed
                return res.status(200).send('Booking already processed.');
            }

            // Now that you have the booking, you have the internal bookingId and plotId
            const bookingId = booking.booking_id;
            const plot = booking.Plot; // Get the included plot object

            if (!plot) {
                console.error(`Webhook: Plot not found for Booking ID ${bookingId}.`);
                await t.rollback();
                return res.status(500).send('Internal plot data missing');
            }

            const plotId = plot.plot_id; // Get the internal plot ID

            // ... existing logic to determine newBookingPaymentStatus, newBookingOutcome, newPlotStatus ...
            // --- 4. Update Booking and Plot Status based on paymentStatusFromWebhook ---
            let newBookingPaymentStatus = booking.paymentStatus; // Default to current status
            let newBookingOutcome = booking.bookingOutcome; // Default to current outcome
            let newPlotStatus = plot.status; // Default to current plot status

            // Map Cashfree status to your internal statuses
            switch (orderStatus) {
                case 'SUCCESS':
                    newBookingPaymentStatus = 'successful'; // Map to your ENUM
                    newBookingOutcome = 'initial_booking_successful'; // Map to your ENUM
                    newPlotStatus = 'booked'; // Map to your ENUM (or 'sold')
                    break;
                case 'FAILED':
                    newBookingPaymentStatus = 'failed'; // Map to your ENUM
                    newBookingOutcome = 'initial_booking_cancelled'; // Map to your ENUM
                    // If the plot was pending payment, revert its status
                    if (plot.status === 'pending_payment') { // Check if the plot was blocked for this booking
                        newPlotStatus = 'available'; // Revert to available
                    }
                    break;
                case 'CANCELLED': // User cancelled payment
                    newBookingPaymentStatus = 'cancelled'; // Map to your ENUM
                    newBookingOutcome = 'initial_booking_cancelled'; // Map to your ENUM
                    // If the plot was pending payment, revert its status
                    if (plot.status === 'pending_payment') {
                        newPlotStatus = 'available'; // Revert to available
                    }
                    break;
                // Handle other Cashfree statuses like 'PENDING', 'FLAGGED', 'USER_DROPPED', 'EXPIRED'
                // Decide how these map to your internal statuses and plot statuses.
                default:
                    console.warn(`Webhook: Unhandled Cashfree payment status: ${paymentStatusFromWebhook} for order ${orderId}.`);
                    // You might set a specific status like 'unknown' or 'review_needed'
                    // newBookingPaymentStatus = 'review_needed';
                    break;
            }


            // Update the booking record
            await booking.update({
                paymentStatus: newBookingPaymentStatus,
                bookingOutcome: newBookingOutcome,
                paymentId: paymentId || booking.paymentId,
                paymentMethod: paymentMethod || booking.paymentMethod,
                paymentAmount: paymentAmount !== undefined && paymentAmount !== null ? paymentAmount : booking.paymentAmount,
            }, { transaction: t });
            // Update the plot status
            if (plot.status !== newPlotStatus) {
                await plot.update({ status: newPlotStatus }, { transaction: t });
            }


            // --- Commit the transaction ---
            await t.commit();
            console.log(`Webhook: Database updated successfully for Booking ${bookingId}.`);

            // --- Respond to Cashfree ---
            res.status(200).send('Webhook received and processed');

        } catch (error) {
            await t.rollback(); // Roll back transaction
            console.error('Webhook: Error processing Cashfree webhook (DB update):', error);
            res.status(500).send('Error processing webhook');
        }

    } catch (error) {
        // This catch handles errors during signature verification or initial parsing setup
        console.error('Webhook: Error during signature verification or initial processing:', error);
        res.status(500).send('Error processing webhook'); // Return 500 for unexpected errors
    }
};

export {
    createOrder,
    verifyOrder,
    handlePaymentWebhook,
};
