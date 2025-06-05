import { sequelize } from "../config/db.js";

// Ensure your auth middleware attaches the internal user ID to req.user
// For example: req.user = { clerkId: '...', internalUserId: 123 };

// Controller function to initiate the booking process
const initiateBooking = async (req, res) => {
    // Get plotId and optional agentCode from the frontend request body
    const { plotId, agentCode } = req.body;
    // Get the authenticated user's internal database ID from the middleware
    const userId = req.user.internalUserId; // This comes from your authMiddleware

    // Basic validation
    if (!plotId) {
        return res.status(400).json({ error: "Plot ID is required to initiate booking." });
    }
    if (!userId) {
        console.error("Authenticated user's internal ID not found in req.user.");
        // This indicates an issue with authMiddleware or user not linked in DB
        return res.status(401).json({ error: "Authenticated user not linked to an internal user record." });
    }

    // Use a Sequelize transaction for atomicity
    const t = await sequelize.transaction();

    try {
        // 1. Check Plot Availability and get details
        const plot = await sequelize.models.Plot.findByPk(plotId, { transaction: t });

        if (!plot) {
            await t.rollback();
            return res.status(404).json({ message: "Plot not found." });
        }

        // Check if the plot is available for booking
        if (plot.status !== 'available') {
            await t.rollback();
            return res.status(409).json({ message: `Plot is not available for booking. Current status: ${plot.status}` });
        }

        // 2. Create Initial Booking Record
        // Set initial statuses and link to user and plot
        const newBooking = await sequelize.models.Booking.create({
            user_id: userId,
            plot_id: plotId,
            // bookingDate defaults to NOW in the model definition
            paymentStatus: 'pending', // Payment hasn't started yet
            agentCode: agentCode || null, // Save agent code if provided
            bookingOutcome: 'initial_booking_initiated', // Mark the start of the process
            // paymentAmount, paymentId, paymentMethod will be updated later
        }, { transaction: t });

        // 3. Temporarily Block Plot (update status)
        // Set the plot status to indicate it's in the payment process
        await plot.update({ status: 'pending_payment' }, { transaction: t }); // Or 'on_hold'

        // 4. Commit the transaction
        await t.commit();

        // 5. Return necessary info to the frontend for the next step (Cashfree payment)
        return res.status(200).json({
            message: "Booking initiated successfully. Proceeding to payment.",
            bookingId: newBooking.booking_id, // Return the newly created booking ID
            plotId: plot.plot_id, // Return the plot ID (should be same as plotId sent in request)
            minimumBookingAmount: plot.minimumBookingAmount, // Return the minimum booking amount from the plot
            // You might include other plot details if needed by the frontend for payment
        });

    } catch (error) {
        // Roll back transaction on error
        await t.rollback();
        console.error("Error during booking initiation:", error);
        // Return a generic error message to the user, log details on the backend
        return res.status(500).json({ error: "Internal Server Error during booking initiation." });
    }
};

// Controller function to get a single booking by ID
// Should be accessible by the booking owner or an administrator
const getBookingDetailsById = async (req, res) => {
    // Get bookingId from URL parameters (defined in the route, e.g., /bookings/:bookingId)
    const bookingId = req.params.bookingId;
    // Get authenticated user's internal database ID from authMiddleware
    const userId = req.user.internalUserId;

    // Basic validation for bookingId
    if (!bookingId) {
        return res.status(400).json({ error: "Booking ID is required in URL parameters." });
    }
    // Ensure user is authenticated
    if (!userId) {
        // This indicates authMiddleware didn't work or user is not linked internally
        console.error("Authenticated user's internal ID not found in req.user for getBookingDetailsById.");
        return res.status(401).json({ error: "Authentication failed." });
    }

    try {
        // Find the booking by ID
        // Use a transaction if consistency is critical (e.g., if this endpoint could also trigger state changes),
        // but for a simple read, a transaction might be overkill.
        // const t = await sequelize.transaction();

        // Include associated Plot and Project data using Sequelize associations
        const booking = await sequelize.models.Booking.findByPk(bookingId, {
            include: [
                {
                    model: sequelize.models.Plot, // Include the associated Plot model
                    include: [
                        {
                            model: sequelize.models.Project, // Include the associated Project model from the Plot
                            attributes: ['project_id', 'name', 'location'] // Select only necessary project attributes
                        }
                    ],
                    // Select only necessary plot attributes. Include minimumBookingAmount for display.
                    attributes: ['plot_id', 'plot', 'price', 'minimumBookingAmount', 'status'] // Include plot status for context
                },
                {
                    model: sequelize.models.User, // Include the associated User model
                    // Select user details that are safe to expose to the owner
                    // attributes: ['user_id', 'clerkId', 'firstName', 'lastName', 'phoneNumber', 'email']
                    attributes: ['user_id', 'clerkId']
                }
                // You could include other associations here, e.g., Payments if you have a Payments model
            ]
            // , transaction: t // If using transaction
        });

        // If booking not found, roll back and return 404
        if (!booking) {
            // await t.rollback(); // If using transaction
            return res.status(404).json({ message: "Booking not found." });
        }

        // --- Authorization Check ---
        // Ensure the authenticated user is the owner of the booking
        // (Assuming this route is protected by authMiddleware)
        const isOwner = booking.user_id === userId;

        // If the user is not the owner, return 403 Forbidden
        // If you also had an adminAuthMiddleware on this route, you could add || isAdminUser here
        if (!isOwner) {
            console.warn(`User ${userId} attempted to access Booking ${bookingId} which they do not own.`);
            // await t.rollback(); // If using transaction
            return res.status(403).json({ message: "Forbidden: You do not have permission to view this booking." });
        }

        // If authorized, commit and return the booking details
        // await t.commit(); // If using transaction
        return res.status(200).json(booking);

    } catch (error) {
        // await t.rollback(); // If using transaction
        console.error("Error fetching booking details by ID:", error);
        return res.status(500).json({ error: "Internal Server Error fetching booking details." });
    }
};

// ... ensure your other booking controller functions (placeholders or implementations) are here ...
// e.g., handlePaymentWebhook, manualBookingUpdate, getAllBookings, etc.
// Controller function for manual admin updates to booking/plot status
// Requires admin authentication
const manualBookingUpdate = async (req, res) => {
    // Get bookingId from URL parameters
    const bookingId = req.params.bookingId;
    // Get update parameters from the request body
    // These are the fields an admin wants to change
    const { paymentStatus, bookingOutcome, agentCode, paymentAmount, paymentMethod, paymentId } = req.body;

    let newPlotStatus;
    if (bookingOutcome === "sale_successful") {
        newPlotStatus = "sold";
    } else if (bookingOutcome === "sale_failed") {
        newPlotStatus = "available";
    } else { };

    // You might want to add validation here to ensure allowed fields are being updated
    // and that the values are valid ENUM values where applicable.

    // Use a Sequelize transaction for atomicity
    const t = await sequelize.transaction();

    try {
        // Find the booking record by ID
        const booking = await sequelize.models.Booking.findByPk(bookingId, { transaction: t });

        if (!booking) {
            await t.rollback();
            return res.status(404).json({ message: "Booking not found." });
        }

        // Prepare updates for the booking record
        const bookingUpdates = {};
        if (paymentStatus !== undefined) bookingUpdates.paymentStatus = paymentStatus;
        if (bookingOutcome !== undefined) bookingUpdates.bookingOutcome = bookingOutcome;
        if (agentCode !== undefined) bookingUpdates.agentCode = agentCode;
        if (paymentAmount !== undefined) bookingUpdates.paymentAmount = paymentAmount; // Remember this is integer
        if (paymentMethod !== undefined) bookingUpdates.paymentMethod = paymentMethod;
        if (paymentId !== undefined) bookingUpdates.paymentId = paymentId;


        // Update the booking record if there are updates
        if (Object.keys(bookingUpdates).length > 0) {
            await booking.update(bookingUpdates, { transaction: t });
            console.log(`Booking ${bookingId} updated with:`, bookingUpdates);
        }

        // If a new plot status is provided, update the associated plot
        if (newPlotStatus !== undefined) {
            const plot = await sequelize.models.Plot.findByPk(booking.plot_id, { transaction: t });

            if (!plot) {
                console.error(`Plot not found for booking ID ${bookingId} during manual update.`);
                // Decide how to handle this - log and return success for booking update, or rollback
                // For this example, we'll log and proceed with booking update success
            } else {
                const oldPlotStatus = plot.status;
                await plot.update({ status: newPlotStatus }, { transaction: t });
                console.log(`Plot ${plot.plot_id} status manually updated from ${oldPlotStatus} to ${newPlotStatus} for booking ${bookingId}.`);
            }
        }

        // Commit the transaction
        await t.commit();

        // Fetch the updated booking record to return in the response
        const updatedBooking = await sequelize.models.Booking.findByPk(bookingId); // Fetch again to get latest data after commit
        return res.status(200).json({ message: "Booking and/or Plot status updated manually.", booking: updatedBooking });

    } catch (error) {
        // Roll back transaction on error
        await t.rollback();
        console.error("Error during manual booking update:", error);
        // Return a generic error message to the user
        return res.status(500).json({ error: "Internal Server Error during manual update." });
    }
};

// Controller function to get ALL bookings for admin view
// Should only be accessible by administrators
const getAllBookings = async (req, res) => {
    // No specific user check needed *within* the controller here,
    // as the adminAuthMiddleware on the route should handle authorization.
    console.log("Admin endpoint: Fetching all bookings.");

    try {
        // Find all booking records
        // Include associated Plot and Project data using Sequelize associations
        // Use the same include structure as getBookingDetailsById to get rich data
        const allBookings = await sequelize.models.Booking.findAll({
            include: [
                {
                    model: sequelize.models.Plot, // Include the associated Plot model
                    include: [
                        {
                            model: sequelize.models.Project, // Include the associated Project model from the Plot
                            attributes: ['project_id', 'name', 'location'] // Select necessary project attributes
                        }
                    ],
                    // Select necessary plot attributes for the admin table
                    attributes: ['plot_id', 'plot', 'price', 'minimumBookingAmount', 'status']
                },
                {
                    model: sequelize.models.User, // Include the associated User model
                    // Select necessary user attributes for the admin table
                    // Include firstName, lastName, phoneNumber if you plan to display them from DB (depends on user model design)
                    // If your User model only has user_id and clerkId, stick to those.
                    attributes: ['user_id', 'clerkId'] // Adjust based on your User model fields
                }
                // You could include other associations here (e.g., Agent) if needed
            ],
            order: [['createdAt', 'DESC']], // Order by creation date, newest first (optional)
            // Consider limiting fields in the top-level Booking model if you don't need all of them in the table
            // attributes: ['booking_id', 'paymentStatus', 'createdAt', 'updatedAt', 'agentCode', 'paymentAmount', 'paymentMethod']
        });

        // Return the list of booking details with included data
        return res.status(200).json(allBookings);

    } catch (error) {
        console.error("Error fetching all bookings for admin:", error);
        return res.status(500).json({ error: "Internal Server Error fetching bookings." });
    }
};

// Controller function to get all bookings for the authenticated user
// Should be accessible by any authenticated user
const getUserBookings = async (req, res) => {
    // Get the authenticated user's internal database ID from the middleware
    const userId = req.user.internalUserId; // This comes from your authMiddleware

    // Basic validation
    if (!userId) {
        console.error("Authenticated user's internal ID not found in req.user for getUserBookings.");
        // This indicates an issue with authMiddleware or user not linked in DB
        return res.status(401).json({ error: "Authenticated user not linked to an internal user record." });
    }

    console.log(`Workspaceing bookings for user ID: ${userId}`);

    try {
        // Find all booking records associated with this specific user ID
        const userBookings = await sequelize.models.Booking.findAll({
            where: {
                user_id: userId // Filter by the authenticated user's ID
            },
            include: [
                {
                    model: sequelize.models.Plot, // Include the associated Plot model
                    include: [
                        {
                            model: sequelize.models.Project, // Include the associated Project model from the Plot
                            attributes: ['project_id', 'name', 'location'] // Select necessary project attributes
                        }
                    ],
                    // Select necessary plot attributes for display
                    attributes: ['plot_id', 'plot', 'price', 'minimumBookingAmount', 'status'] // Use 'plotNo' as per your model
                },
                {
                    model: sequelize.models.User, // Include the associated User model
                    // Select necessary user attributes. Only expose what's relevant to the user's view,
                    // which for their own bookings might just be their Clerk ID for verification.
                    attributes: ['user_id', 'clerkId']
                }
                // You could include other associations here, e.g., Payments if you have a Payments model
            ],
            order: [['createdAt', 'DESC']], // Order by creation date, newest first (optional)
        });

        // Return the list of booking details with included data
        return res.status(200).json(userBookings);

    } catch (error) {
        console.error("Error fetching user bookings:", error);
        return res.status(500).json({ error: "Internal Server Error fetching user bookings." });
    }
};

const cancelPendingBookingByUser = async (req, res) => {
    const bookingId = req.params.bookingId;
    const userId = req.user.internalUserId; // Assuming authMiddleware sets this
    // We'll pass a specific reason from frontend, or default
    // const { reason = 'cancelled_by_user' } = req.body; //currently hardcoding the reason, might change it later if we modify the architecture.
    const reason = 'cancelled_by_user'

    const t = await sequelize.transaction();
    try {
        const booking = await sequelize.models.Booking.findOne({
            where: { booking_id: bookingId, user_id: userId },
            transaction: t,
            lock: { level: t.LOCK.UPDATE, of: sequelize.models.Booking }
        });

        if (!booking) {
            await t.rollback();
            return res.status(404).json({ message: "Booking not found or does not belong to you." });
        }

        // IMPORTANT: Only cancel if payment is pending or initial.
        // This prevents overwriting a 'successful' status if a webhook arrives late.
        if (booking.paymentStatus === 'successful' || booking.paymentStatus === 'refunded') {
            await t.rollback();
            return res.status(409).json({ message: `Booking status is ${booking.paymentStatus}. Cannot be cancelled.` });
        }

        await booking.update({
            paymentStatus: 'cancelled', // Or 'user_abandoned' if you want more specific tracking
            bookingOutcome: reason // Use the reason passed from frontend
        }, { transaction: t });

        const plot = await sequelize.models.Plot.findByPk(booking.plot_id, { transaction: t });
        if (plot && plot.status !== 'available') {
            await plot.update({ status: 'available' }, { transaction: t });
        }

        await t.commit();
        return res.status(200).json({ message: "Booking cancelled successfully. Plot freed up." });

    } catch (error) {
        await t.rollback();
        console.error("Error cancelling pending booking:", error);
        return res.status(500).json({ error: "Internal Server Error." });
    }
};

// Export all relevant functions at the end of the file
export {
    // ... export other functions ...
    initiateBooking,
    // ... export webhook/manual update handlers if you implement them later ...
    // handlePaymentWebhook,
    getAllBookings,
    manualBookingUpdate,
    getBookingDetailsById,
    getUserBookings,
    cancelPendingBookingByUser,
};
// export const addBooking = async (req, res) => {
//     try {
//         const { user_id, plot_id, bookingDate, paymentStatus, paymentId, paymentMethod, paymentAmount, agentCode } = req.body;
//
//         if (!user_id || !plot_id) {
//             return res.status(400).json({ error: "User ID and Plot ID are required for booking." });
//         }
//
//         const newBooking = await sequelize.models.Booking.create({
//             user_id,
//             plot_id,
//             bookingDate,
//             paymentStatus,
//             paymentId,
//             paymentMethod,
//             paymentAmount,
//             agentCode,
//         });
//
//         return res.status(201).json(newBooking);
//     } catch (error) {
//         console.error("Error adding booking:", error);
//         return res.status(500).json({ error: "Internal Server Error" });
//     }
// };
//
// export const getAllBookings = async (req, res) => {
//     try {
//         const bookings = await sequelize.models.Booking.findAll({
//             include: [
//                 { model: sequelize.models.User },
//                 { model: sequelize.models.Plot },
//             ],
//         });
//         return res.status(200).json(bookings);
//     } catch (error) {
//         console.error("Error fetching all bookings:", error);
//         return res.status(500).json({ error: "Internal Server Error" });
//     }
// };
//
// export const getBookingById = async (req, res) => {
//     const bookingId = req.params.bookingId;
//     try {
//         const booking = await sequelize.models.Booking.findByPk(bookingId, {
//             include: [
//                 { model: sequelize.models.User },
//                 { model: sequelize.models.Plot },
//             ],
//         });
//         if (!booking) {
//             return res.status(404).json({ message: "Booking not found." });
//         }
//         return res.status(200).json(booking);
//     } catch (error) {
//         console.error("Error fetching booking by ID:", error);
//         return res.status(500).json({ error: "Internal Server Error" });
//     }
// };
//
// export const updateBooking = async (req, res) => {
//     const bookingId = req.params.bookingId;
//     try {
//         const [updated] = await sequelize.models.Booking.update(req.body, {
//             where: { booking_id: bookingId },
//         });
//
//         if (updated === 0) {
//             return res.status(404).json({ message: "Booking not found." });
//         }
//
//         const updatedBooking = await sequelize.models.Booking.findByPk(bookingId, {
//             include: [
//                 { model: sequelize.models.User },
//                 { model: sequelize.models.Plot },
//             ],
//         });
//         return res.status(200).json({ message: "Booking updated successfully.", booking: updatedBooking });
//     } catch (error) {
//         console.error("Error updating booking:", error);
//         return res.status(500).json({ error: "Internal Server Error" });
//     }
// };
//
// export const deleteBooking = async (req, res) => {
//     const bookingId = req.params.bookingId;
//     try {
//         const deleted = await sequelize.models.Booking.destroy({
//             where: { booking_id: bookingId },
//         });
//
//         if (deleted === 0) {
//             return res.status(404).json({ message: "Booking not found." });
//         }
//
//         return res.status(204).send(); // 204 No Content for successful deletion
//     } catch (error) {
//         console.error("Error deleting booking:", error);
//         return res.status(500).json({ error: "Internal Server Error" });
//     }
// };
