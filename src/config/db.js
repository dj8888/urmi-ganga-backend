import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('testdb', 'testuser', 'testpassword', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false // Disable logging
});
//require('dotenv').config();
//
//const sequelize = new Sequelize(
//  process.env.DB_NAME,
//  process.env.DB_USER,
//  process.env.DB_PASSWORD,
//  {
//    host: process.env.DB_HOST,
//    port: process.env.DB_PORT || 5432,
//    dialect: 'postgres',
//  }
//);

// Load all models
const modelDefiners = [
    '../models/agent.model.js',
    '../models/project.model.js',
    '../models/plot.model.js',
    '../models/booking.model.js',
    '../models/user.model.js',
    //'../models/commission.model.js',
    //'../models/contactForm.model.js',
    //'../models/stakeholder.model.js',
];

async function loadModels() {
    for (const modelPath of modelDefiners) {
        const { default: modelDefiner } = await import(modelPath);
        modelDefiner(sequelize);
    }

    // Execute associations after models are defined
    Object.keys(sequelize.models).forEach(modelName => {
        if (sequelize.models[modelName].associate) {
            sequelize.models[modelName].associate(sequelize.models);
        }
    });
}

const connection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        await loadModels(); // Load models asynchronously
        //await sequelize.sync({ force: true });
        await sequelize.sync({ alter: true }); //force will remove all previous data if backend is changed.
        //await sequelize.sync();
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

export {
    connection,
    sequelize
}
