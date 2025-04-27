import { sequelize } from "../config/db.js";
import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY, publishableKey: process.env.CLERK_PUBLISHABLE_KEY });

export const syncUserToDatabase = async (req, res) => {
    try {
        const { clerkId } = req.body; // Clerk ID sent by frontend

        if (!clerkId) {
            return res.status(400).json({ message: "Bad Request: Missing Clerk ID" });
        }

        // Fetch user details from Clerk
        const clerkUser = await clerkClient.users.getUser(clerkId);

        if (!clerkUser) {
            return res.status(404).json({ message: "User not found in Clerk" });
        }

        const User = sequelize.models.User; // Access the User model

        // Check if the user already exists
        let existingUser = await User.findOne({ where: { clerkId } });

        if (!existingUser) {
            // Create a new user in the database
            existingUser = await User.create({
                clerkId: clerkUser.id,
            });

            console.log(`User ${clerkUser.id} successfully synced with the database.`);
        } else {
            console.log(`User ${clerkUser.id} already exists.`);
        }

        res.status(200).json({ message: "User synced successfully", user: existingUser });
    } catch (error) {
        console.error("Error syncing user:", error);
        res.status(500).json({ message: "Internal Server Error during user sync" });
    }
};
//export const addUser = async (req, res) => {
//    try {
//        const { phoneNumber, clerkId } = req.body;
//
//        if (!phoneNumber) {
//            return res.status(400).json({ error: "Phone number is required." });
//        }
//
//        const newUser = await sequelize.models.User.create({
//            phoneNumber,
//            clerkId,
//        });
//
//        return res.status(201).json(newUser);
//    } catch (error) {
//        console.error("Error adding user:", error);
//        return res.status(500).json({ error: "Internal Server Error" });
//    }
//};
//
//export const getAllUsers = async (req, res) => {
//    try {
//        const users = await sequelize.models.User.findAll();
//        return res.status(200).json(users);
//    } catch (error) {
//        console.error("Error fetching all users:", error);
//        return res.status(500).json({ error: "Internal Server Error" });
//    }
//};
//
//export const getUserById = async (req, res) => {
//    const userId = req.params.userId;
//    try {
//        const user = await sequelize.models.User.findByPk(userId);
//        if (!user) {
//            return res.status(404).json({ message: "User not found." });
//        }
//        return res.status(200).json(user);
//    } catch (error) {
//        console.error("Error fetching user by ID:", error);
//        return res.status(500).json({ error: "Internal Server Error" });
//    }
//};
//
//export const updateUser = async (req, res) => {
//    const userId = req.params.userId;
//    try {
//        const [updated] = await sequelize.models.User.update(req.body, {
//            where: { user_id: userId },
//        });
//
//        if (updated === 0) {
//            return res.status(404).json({ message: "User not found." });
//        }
//
//        const updatedUser = await sequelize.models.User.findByPk(userId);
//        return res.status(200).json({ message: "User updated successfully.", user: updatedUser });
//    } catch (error) {
//        console.error("Error updating user:", error);
//        return res.status(500).json({ error: "Internal Server Error" });
//    }
//};
//
//export const deleteUser = async (req, res) => {
//    const userId = req.params.userId;
//    try {
//        const deleted = await sequelize.models.User.destroy({
//            where: { user_id: userId },
//        });
//
//        if (deleted === 0) {
//            return res.status(404).json({ message: "User not found." });
//        }
//
//        return res.status(204).send(); // 204 No Content for successful deletion
//    } catch (error) {
//        console.error("Error deleting user:", error);
//        return res.status(500).json({ error: "Internal Server Error" });
//    }
//};
