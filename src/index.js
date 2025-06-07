import dotenv from 'dotenv';
dotenv.config(); // This loads the environment variables from .env
import express from 'express';
import cors from 'cors';
import cron from 'node-cron';


import { connection } from './config/db.js';
import agentRoutes from './view/agent.routes.js';
import projectRoutes from './view/project.routes.js';
import paymentRoutes from './view/payment.routes.js'; // Import payment routes
import userRoutes from './view/user.routes.js';
import bookingRoutes from './view/booking.routes.js';
import { cleanupPendingBookings } from './controllers/cleanup.controller.js'; // Import cleanup controller function

const app = express();

// ✅ Apply raw body parsing **ONLY for webhook route**
import bodyParser from 'body-parser';
app.use('/api/payments/cashfree-webhook', bodyParser.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

const corsOptions = {
    origin: [
        'http://localhost:5173', // For your local frontend development
        process.env.FRONTEND_URL, // <-- REPLACE WITH YOUR ACTUAL NETLIFY URL HERE
        process.env.CLERK_FRONTEND_API // If Clerk uses your frontend API domain for auth
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Ensure all methods your frontend uses are listed
    credentials: true // Crucial for sending/receiving cookies and authentication headers
};
app.use(cors(corsOptions));

// CORS configuration options
//const corsOptions = {
//    origin: 'http://your-client-domain.com', // Replace with your frontend domain
//    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods
//    credentials: true // Enable cookies and authentication headers
//};

// Apply CORS middleware
//app.use(cors(corsOptions));

////////////////////////////////////////////
//app.use(express.urlencoded({ extended: true })) is used to parse incoming requests with URL-encoded data, like form submissions or data sent using application/x-www-form-urlencoded content type. It processes data into a format that Express can understand and use.
//
//What Does extended: true Do?
//The extended option determines how the parsing is done:
//true: Allows for rich objects and arrays to be encoded into the URL-encoded format, using the qs library.
//false: Uses the querystring library, which supports only simple key-value pairs.
//
//In most cases, extended: true is preferred, especially when working with complex nested objects in your request payload.
//
//When Should You Use It?
//You should use express.urlencoded() alongside express.json() when your backend expects:
//Form Data: Data submitted via HTML forms or similar.
//Mixed Content: APIs that might send both JSON and URL-encoded data.

app.use('/api/agents', agentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/payments', paymentRoutes); // Mount payment routes
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);

//ADMIN - PROTECTED ROUTES
//app.use('/api/admin', agentRoutes);

// Access the PORT number from process.env
const PORT = process.env.PORT || 8000; // Use 8000 as a default if PORT is not defined in .env

// await connection();
// --- Memory logging logic ---
function logMemoryUsage() {
    const mu = process.memoryUsage();
    console.log('--- Memory Usage ---');
    console.log(`RSS (Resident Set Size): ${(mu.rss / 1024 / 1024).toFixed(2)} MB`); // Total memory consumed by process (what OS sees)
    console.log(`Heap Total (V8): ${(mu.heapTotal / 1024 / 1024).toFixed(2)} MB`); // Total size of V8 heap
    console.log(`Heap Used (V8): ${(mu.heapUsed / 1024 / 1024).toFixed(2)} MB`);   // Memory used by JS objects
    console.log(`External: ${(mu.external / 1024 / 1024).toFixed(2)} MB`);       // Memory for C++ objects bound to JS
    console.log('--------------------');
}

// --- Database Connection and Server Start ---
// This is the ideal place to schedule the cron job
(async () => {
    try {
        await connection(); // This establishes DB connection and loads/syncs models
        console.log('Database and models ready.');

        // ------ SCHEDULE THE CLEANUP JOB ------
        // Runs every 15 minutes. Adjust the cron string as needed.
        // Make sure cleanupPendingBookings function is correctly imported.
        cron.schedule('*/20 * * * *', () => {
            console.log('Running scheduled booking cleanup job...');
            // The cleanupPendingBookings function already uses sequelize and models internally
            cleanupPendingBookings();
        });
        console.log('Scheduled cleanup job to run every 15 minutes.');
        // --------------------------------------

        app.listen(PORT, () => {
            console.log(`Server is running at Port:${PORT}`);
            // Optional: Log memory periodically or on a specific API call
            console.log('Logging Memory Usage every 10 minutes');
            setInterval(logMemoryUsage, 600000); // Log every 10 minutes
        });

    } catch (error) {
        console.error('Failed to connect to the database or start server:', error);
        process.exit(1); // Exit process if DB connection fails
    }
})(); // Immediately invoked async function

// app.listen(PORT, () => {
//     console.log(`Server is running at Port:${PORT}`)
// });

