import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Plot = sequelize.define('Plot', {
        plot_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        project_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Projects',
                key: 'project_id',
            },
            onDelete: 'CASCADE',
        },
        plot: {
            type: DataTypes.STRING,
        },
        area: { // Area can still be decimal
            type: DataTypes.DECIMAL,
        },
        coordinates: {
            type: DataTypes.JSON,
        },
        status: {
            type: DataTypes.ENUM('available', 'on_hold', 'pending_payment', 'booked', 'sold', 'other'),
            defaultValue: 'available',
        },
        price: { // Changed to INTEGER
            type: DataTypes.INTEGER,
        },
        facing: {
            type: DataTypes.STRING,
        },
        minimumBookingAmount: { // Changed to INTEGER
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 500,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    });

    Plot.associate = (models) => {
        Plot.belongsTo(models.Project, { foreignKey: 'project_id', onDelete: 'CASCADE' });
        Plot.hasOne(models.Booking, { foreignKey: 'plot_id', onDelete: 'SET NULL' });
    };

    return Plot;
};
