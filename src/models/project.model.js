import { DataTypes } from "sequelize";

export default (sequelize) => {
    const Project = sequelize.define('Project', {
        project_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        location: {
            type: DataTypes.STRING,
        },
        totalArea: {
            type: DataTypes.DECIMAL, // Using DECIMAL for area is generally better for precision
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false, // Or false if every project must have a start date
        },
        completionDate: { // New field for completion date
            type: DataTypes.DATE,
            allowNull: false, // Or false if every project must have a completion date
        },
        projectBoundary: { // Changed from layoutData to projectBoundary
            type: DataTypes.JSON, // Store only the project boundary coordinates
            allowNull: false, // Assuming a project might not always have a boundary defined initially
        },
        status: {
            type: DataTypes.ENUM('upcoming', 'booking_ongoing', 'completed', 'sold_out', 'other'),
            defaultValue: 'upcoming',
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        imageUrls: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        amenities: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        landmarks: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        googleMapsUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    });

    Project.associate = (models) => {
        Project.hasMany(models.Plot, { foreignKey: 'project_id', onDelete: 'CASCADE' });
    };

    return Project;
};
