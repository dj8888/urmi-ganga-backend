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
            type: DataTypes.INTEGER, // Or FLOAT depending on precision needs
        },
        layoutData: {
            type: DataTypes.JSON, // Or JSON if you prefer
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    });

    Project.associate = (models) => {
        Project.hasMany(models.Plot, { foreignKey: 'project_id', onDelete: 'CASCADE' });
    };

    return Project;
};
