import { DataTypes, UUIDV4 } from "sequelize";
import { customAlphabet } from "nanoid";

export default (sequelize) => {
    const Agent = sequelize.define('Agent', {
        agent_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phoneNumber: {
            type: DataTypes.STRING(10),
            unique: true,
        },
        code: {
            type: DataTypes.STRING(8), // Enforce the length
            allowNull: false,
            unique: true,
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    });

    //Agent.associate = (models) => {
    //    Agent.hasMany(models.Commission, { foreignKey: 'agent_id', onDelete: 'CASCADE' });
    //    Agent.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'SET NULL' });
    //};

    // Hook to generate a unique code before creating a new agent
    Agent.beforeValidate(async (agent) => {
        // Define your custom codeChars (numbers and letters only)
        const codeChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        // Create a custom nanoid generator
        const nanoid = customAlphabet(codeChars, 8); // 21 is the length of the ID
        agent.code = nanoid(); // Generates an 8-character alphanumeric code
        // You might want to add logic here to check if the code already exists and regenerate if needed
        // for very high volume applications to avoid potential collisions, though nanoid is quite safe.
    });

    return Agent;
}
