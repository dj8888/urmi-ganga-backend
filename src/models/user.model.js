import { DataTypes } from "sequelize";

export default (sequelize) => {
    const User = sequelize.define('User', {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        clerkId: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: true,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    });

    User.associate = (models) => {
        User.hasMany(models.Booking, { foreignKey: 'user_id', onDelete: 'SET NULL' });
    };

    return User;
};
