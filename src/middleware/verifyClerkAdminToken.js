//src/middleware/verifyClerkAdminToken.js
import dotenv from 'dotenv';
dotenv.config(); // This loads the environment variables from .env
import jwt from "jsonwebtoken"; // Library to decode JWT

import { createClerkClient } from '@clerk/backend';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY, publishableKey: process.env.CLERK_PUBLISHABLE_KEY });

const verifyClerkAdminToken = async (req, res, next) => {
    try {
        // Construct the full URL for the request
        const fullUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

        // Use authenticateRequest to validate the token
        const requestState = await clerkClient.authenticateRequest(
            new Request(fullUrl, { headers: req.headers }), // Pass full URL and headers
            {
                authorizedParties: ["http://localhost:5173"], // Replace with your frontend domain
            }
        );

        if (!requestState.isSignedIn) {
            return res.status(401).json({ message: "Unauthorized: Invalid token or user not signed in" });
        }

        //console.log("User is signed in:", requestState);

        // Decode the token to extract userId and sessionId
        const decodedToken = jwt.decode(requestState.token);

        if (!decodedToken || !decodedToken.sub) {
            return res.status(401).json({ message: "Unauthorized: Unable to extract user details from token" });
        }

        const userId = decodedToken.sub; // User ID is stored in the `sub` claim
        //console.log("Decoded userId:", userId);

        // Fetch user metadata using Clerk SDK
        const user = await clerkClient.users.getUser(userId);

        // Verify admin role
        const isAdmin =
            user.publicMetadata?.role === "admin" || user.privateMetadata?.role === "admin";

        if (!isAdmin) {
            console.warn(`User ${user.id} attempted admin access without admin role.`);
            return res.status(403).json({ message: "Forbidden: Not an admin" });
        }

        // Attach user info to the request object for downstream usage
        req.adminUser = user;

        next(); // Proceed to route handler
    } catch (error) {
        console.error("Error verifying Clerk session:", error);
        return res.status(500).json({ message: "Internal Server Error during authentication" });
    }
};

export default verifyClerkAdminToken;

