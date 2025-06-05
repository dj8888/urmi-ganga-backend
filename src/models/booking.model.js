import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Booking = sequelize.define('Booking', {
        booking_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false, // User is required for a booking
            references: {
                model: 'Users', // This should match the table name Sequelize uses for your User model
                key: 'user_id',
            },
            onDelete: 'CASCADE', // If user is deleted, delete their bookings
        },
        plot_id: {
            type: DataTypes.INTEGER,
            allowNull: false, // Plot is required for a booking
            references: {
                model: 'Plots', // This should match the table name Sequelize uses for your Plot model
                key: 'plot_id',
            },
            onDelete: 'CASCADE', // If plot is deleted, delete associated bookings
        },
        bookingDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW, // Default to current date/time
        },
        paymentStatus: {
            type: DataTypes.ENUM('pending', 'in_progress', 'successful', 'failed', 'refunded', 'cancelled', 'expired'),
            defaultValue: 'pending', // Initial status when booking is created
        },
        paymentId: {
            type: DataTypes.STRING, // Transaction ID from the payment gateway (e.g., Cashfree order_id)
            allowNull: true, // Null initially
        },
        paymentMethod: {
            type: DataTypes.STRING, // e.g., "Credit Card", "UPI", "Cashfree"
            allowNull: true, // Null initially
        },
        paymentAmount: {
            type: DataTypes.INTEGER, // Stored as integer (e.g., in paise)
            allowNull: true, // Null initially, updated after payment
        },
        agentCode: {
            type: DataTypes.STRING,
            allowNull: true, // Optional field
        },
        // Field to track the overall outcome of the booking process (beyond initial online payment)
        bookingOutcome: {
            type: DataTypes.ENUM('initial_booking_initiated', 'initial_booking_successful', 'initial_booking_cancelled', 'sale_successful', 'sale_failed', 'lapsed', 'cancelled_by_user', 'cancelled_by_admin'),
            defaultValue: 'initial_booking_initiated', // Set after initiateBooking endpoint is called
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    });

    Booking.associate = (models) => {
        // Define associations
        Booking.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
        Booking.belongsTo(models.Plot, { foreignKey: 'plot_id', onDelete: 'CASCADE' });
    };

    return Booking;
};
