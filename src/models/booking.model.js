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
            references: {
                model: 'Users',
                key: 'user_id',
            },
            onDelete: 'SET NULL',
        },
        plot_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Plots',
                key: 'plot_id',
            },
            onDelete: 'SET NULL',
        },
        bookingDate: {
            type: DataTypes.DATE,
        },
        paymentStatus: {
            type: DataTypes.ENUM('pending', 'successful', 'failed', 'refunded'),
            defaultValue: 'pending',
        },
        paymentId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        paymentMethod: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        paymentAmount: {
            type: DataTypes.DECIMAL,
            allowNull: true,
        },
        agentCode: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    });

    Booking.associate = (models) => {
        Booking.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'SET NULL' });
        Booking.belongsTo(models.Plot, { foreignKey: 'plot_id', onDelete: 'SET NULL' });
    };

    return Booking;
};
