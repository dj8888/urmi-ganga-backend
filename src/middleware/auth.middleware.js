// src/middleware/auth.middleware.js
import dotenv from 'dotenv';
dotenv.config();
import jwt from "jsonwebtoken";
import { createClerkClient } from '@clerk/backend';
import { sequelize } from '../config/db.js'; // Import sequelize


const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY, publishableKey: process.env.CLERK_PUBLISHABLE_KEY });

const authMiddleware = async (req, res, next) => {
    try {
        // const fullUrl = `<span class="math-inline">\{req\.protocol\}\://</span>{req.get("host")}${req.originalUrl}`;
        const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
        console.log(fullUrl);

        const requestState = await clerkClient.authenticateRequest(
            new Request(fullUrl, { headers: req.headers }),
            {
                authorizedParties: [process.env.CLERK_AUTHORIZED_PARTY], // Use environment variable
            }
        );

        console.log(requestState);
        if (!requestState.isSignedIn) {
            return res.status(401).json({ message: "Unauthorized: Invalid token or user not signed in" });
        }

        const decodedToken = jwt.decode(requestState.token);

        if (!decodedToken || !decodedToken.sub) {
            return res.status(401).json({ message: "Unauthorized: Unable to extract user details from token" });
        }

        const clerkUserId = decodedToken.sub; // Clerk User ID

        // Optional: Find your internal user record based on Clerk User ID
        // This is useful if your backend needs the internal user_id
        const internalUser = await sequelize.models.User.findOne({
            where: { clerkId: clerkUserId }
        });

        if (!internalUser) {
            // If the user is authenticated via Clerk but doesn't exist in your DB
            // You might want to create a user record here, or handle it differently
            console.warn(`Clerk user ${clerkUserId} signed in but not found in internal DB.`);
            // You might still proceed but indicate the user is not fully registered in your app DB
            // Or return an error if your API requires a linked internal user
        }

        // Attach Clerk user ID and potentially internal user info to the request
        req.user = {
            clerkId: clerkUserId,
            internalUserId: internalUser ? internalUser.user_id : null, // Attach internal ID
            // You could attach other Clerk user details if needed, but avoid sensitive ones
        };

        next(); // Proceed to route handler

    } catch (error) {
        console.error("Error verifying Clerk session:", error);
        return res.status(500).json({ message: "Internal Server Error during authentication" });
    }
};

export { authMiddleware }; // Export as a named export
