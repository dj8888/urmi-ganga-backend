import { sequelize } from "../../config/db.js";

export const addBooking = async (req, res) => {
    try {
        const { user_id, plot_id, bookingDate, paymentStatus, paymentId, paymentMethod, paymentAmount, agentCode } = req.body;

        if (!user_id || !plot_id) {
            return res.status(400).json({ error: "User ID and Plot ID are required for booking." });
        }

        const newBooking = await sequelize.models.Booking.create({
            user_id,
            plot_id,
            bookingDate,
            paymentStatus,
            paymentId,
            paymentMethod,
            paymentAmount,
            agentCode,
        });

        return res.status(201).json(newBooking);
    } catch (error) {
        console.error("Error adding booking:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getAllBookings = async (req, res) => {
    try {
        const bookings = await sequelize.models.Booking.findAll({
            include: [
                { model: sequelize.models.User },
                { model: sequelize.models.Plot },
            ],
        });
        return res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching all bookings:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getBookingById = async (req, res) => {
    const bookingId = req.params.bookingId;
    try {
        const booking = await sequelize.models.Booking.findByPk(bookingId, {
            include: [
                { model: sequelize.models.User },
                { model: sequelize.models.Plot },
            ],
        });
        if (!booking) {
            return res.status(404).json({ message: "Booking not found." });
        }
        return res.status(200).json(booking);
    } catch (error) {
        console.error("Error fetching booking by ID:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const updateBooking = async (req, res) => {
    const bookingId = req.params.bookingId;
    try {
        const [updated] = await sequelize.models.Booking.update(req.body, {
            where: { booking_id: bookingId },
        });

        if (updated === 0) {
            return res.status(404).json({ message: "Booking not found." });
        }

        const updatedBooking = await sequelize.models.Booking.findByPk(bookingId, {
            include: [
                { model: sequelize.models.User },
                { model: sequelize.models.Plot },
            ],
        });
        return res.status(200).json({ message: "Booking updated successfully.", booking: updatedBooking });
    } catch (error) {
        console.error("Error updating booking:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deleteBooking = async (req, res) => {
    const bookingId = req.params.bookingId;
    try {
        const deleted = await sequelize.models.Booking.destroy({
            where: { booking_id: bookingId },
        });

        if (deleted === 0) {
            return res.status(404).json({ message: "Booking not found." });
        }

        return res.status(204).send(); // 204 No Content for successful deletion
    } catch (error) {
        console.error("Error deleting booking:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
