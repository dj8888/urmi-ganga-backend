import dotenv from 'dotenv';
dotenv.config(); // This loads the environment variables from .env
import express from 'express';
import cors from 'cors';
import { connection } from './config/db.js';
import agentRoutes from './view/agent.routes.js';
import projectRoutes from './view/project.routes.js';
import paymentRoutes from './view/payment.routes.js'; // Import payment routes
import userRoutes from './view/user.routes.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cors());

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

//ADMIN - PROTECTED ROUTES
//app.use('/api/admin', agentRoutes);

// Access the PORT number from process.env
const PORT = process.env.PORT || 8000; // Use 8000 as a default if PORT is not defined in .env

await connection();

app.listen(PORT, () => {
    console.log(`Server is running at Port:${PORT}`)
});

