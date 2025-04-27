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
        plotNumber: {
            type: DataTypes.STRING,
        },
        area: {
            type: DataTypes.DECIMAL,
        },
        coordinates: {
            type: DataTypes.JSON,
        },
        status: {
            type: DataTypes.ENUM('available', 'booked', 'sold', 'other'),
            defaultValue: 'available',
        },
        price: {
            type: DataTypes.DECIMAL,
        },
        facing: {
            type: DataTypes.STRING,
        },
        minimumBookingAmount: {
            type: DataTypes.DECIMAL,
            allowNull: false, // Or true if it can be zero or set later
            defaultValue: 500,   // Set a default value if appropriate
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
