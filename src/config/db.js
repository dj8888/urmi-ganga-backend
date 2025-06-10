// src/config/db.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

// import fs from 'fs'; // Import the file system module
// import path from 'path'; // Import the path module
// import { fileURLToPath } from 'url'; // For ES Modules to get __dirname
// // Helper to get __dirname equivalent in ES Modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
//
// // Define the path for the SQL schema file
// const SCHEMA_SQL_FILE = path.join(__dirname, 'schema_dump.sql');
//
// // Create a write stream for the SQL file
// const sqlWriteStream = fs.createWriteStream(SCHEMA_SQL_FILE, { flags: 'w' }); // 'w' to overwrite each time
//
// // Custom logging function
// const customSequelizeLogger = (msg) => {
//     // Sequelize's SQL queries typically start with "Executing (default): "
//     if (msg.startsWith('Executing (default): ')) {
//         const sqlQuery = msg.replace('Executing (default): ', '').trim();
//         // Append a semicolon and newline for better SQL formatting if needed
//         sqlWriteStream.write(sqlQuery + ';\n');
//     }
//     // You can still log other messages to console if you want, but filtered
//     // console.log(msg); // Uncomment this line if you want to see all Sequelize logs in console too
// };


// --- CONDITIONAL SEQUELIZE INITIALIZATION ---
let sequelize; // Declare sequelize variable outside the conditional block
if (process.env.NODE_ENV === 'production') {
    sequelize = new Sequelize(
        process.env.DATABASE_URL,
        {
            logging: false, // Disable logging
            dialect: 'postgres',
            protocol: 'postgres', // Explicitly define protocol for some environments
            dialectOptions: {
                ssl: {
                    require: true, // This is crucial for Supabase to enforce SSL
                    rejectUnauthorized: false // Set to false to allow connections to self-signed certs (common with cloud providers, but less secure than true)
                    // If your Supabase connection uses a specific CA cert, you might set this to true and provide the cert.
                    // For most direct Supabase connections, `require: true` and `rejectUnauthorized: false` works.
                },
                prepare: false // Disable prepared statements
            },
            // Other options like pool configuration can be added here if needed:
            // pool: {
            //     max: 5,
            //     min: 0,
            //     acquire: 30000,
            //     idle: 10000
            // }

        });
} else {
    sequelize = new Sequelize(  //use this for local development instance
        // 'testdb', 'testuser', 'testpassword', {
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            logging: false, // Disable logging
            host: process.env.DB_HOST || localhost,
            port: process.env.DB_PORT || 5432,
            dialect: 'postgres',
            // logging: console.log, // <<< Make sure this is `console.log`
            // logging: customSequelizeLogger, // <<< Use the custom logger here

        });
};

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
        await sequelize.sync();
        // await sequelize.sync({ alter: true }); //force will remove all previous data if backend is changed.
        // IMPORTANT: Temporarily set to { force: true } to generate schema.
        // This will print the CREATE TABLE statements to your console
        // await sequelize.sync({ force: true }); // <<< Make sure this is `{ force: true }`
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

export {
    connection,
    sequelize
}
