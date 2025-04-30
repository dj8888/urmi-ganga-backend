// seeders/initial-data.js
import { sequelize, connection } from '../src/config/db.js'; // Import sequelize and connection

async function seedDatabase() {
    try {
        console.log('Connecting to database and loading models for seeding...');
        await connection();
        console.log('Database connected and models loaded.');

        console.log('Starting database seeding...');

        // --- Create a Sample Project ---
        const sampleProject = await sequelize.models.Project.create({
            name: 'Ranchi Royal Residency',
            location: 'Near Airport Road, Ranchi',
            totalArea: 150000, // in square units (e.g., sq ft)
            projectBoundary: JSON.stringify([
                [0, 0], [500, 0], [500, 300], [0, 300] // Example coordinates for a rectangular boundary
            ]),
            googleMapsUrl: 'https://maps.app.goo.gl/your_Maps_pin_url', // Replace with a real URL
            description: 'A premium residential project located strategically with excellent connectivity.', // Main description
            status: 'completed',
            imageUrls: JSON.stringify([
                'https://imganuncios.mitula.net/residential_plot_in_pithauriya_for_resale_ranchi_the_reference_number_is_16928944_1100001743768802379.jpg', // Placeholder URLs
            ]),
            startDate: new Date('2023-10-15'),
            completionDate: new Date('2025-12-31'),
            amenities: JSON.stringify([ // Sample data for amenities
                { "icon": "FaWater", "name": "24/7 Water Supply" },
                { "icon": "FaBatteryFull", "name": "Electricity Backup" },
                { "icon": "FaRecycle", "name": "Sewage Treatment Plant" },
                { "icon": "FaTree", "name": "Landscaped Gardens" }
            ]),
            landmarks: JSON.stringify([ // Sample data for landmarks
                { "icon": "FaPlane", "name": "Airport", "distance": "5 km" },
                { "icon": "FaHospital", "name": "Hospital", "distance": "3 km" },
                { "icon": "FaSchool", "name": "School", "distance": "2 km" }
            ]),
        });
        console.log('Sample Project created:', sampleProject.toJSON());

        // --- Create Sample Plots for the Project ---
        await sequelize.models.Plot.bulkCreate([
            {
                project_id: sampleProject.project_id,
                plot: 'RRP-A01',
                area: 1200,
                coordinates: JSON.stringify([
                    [10, 10], [40, 10], [40, 30], [10, 30]
                ]),
                status: 'available',
                price: 5000000,
                facing: 'North-East',
                minimumBookingAmount: 100000
            },
            {
                project_id: sampleProject.project_id,
                plot: 'RRP-A02',
                area: 1500,
                coordinates: JSON.stringify([
                    [10, 40], [50, 40], [50, 70], [10, 70]
                ]),
                status: 'on_hold',
                price: 6500000,
                facing: 'North',
                minimumBookingAmount: 150000
            },
            {
                project_id: sampleProject.project_id,
                plot: 'RRP-B15',
                area: 1000,
                coordinates: JSON.stringify([
                    [100, 100], [130, 100], [130, 120], [100, 120]
                ]),
                status: 'available',
                price: 4500000,
                facing: 'East',
                minimumBookingAmount: 90000
            },
            // Add more sample plots
        ]);
        // --- Create a Sample Project ---
        const sampleProject2 = await sequelize.models.Project.create({
            name: 'Sample Project 1',
            location: 'Ratu Road',
            totalArea: 150000, // in square units (e.g., sq ft)
            projectBoundary: JSON.stringify([
                [0, 0], [80, 0], [80, 100], [0, 100]
            ]),
            googleMapsUrl: 'https://maps.app.goo.gl/your_Maps_pin_url', // Replace with a real URL
            description: 'A premium residential project located strategically with excellent connectivity.', // Main description
            status: 'booking_ongoing',
            imageUrls: JSON.stringify([
                'https://housing-images.n7net.in/01c16c28/3950dfb5f7f0221c1e84d31f5324224d/v0/large/residential_plot-for-sale-gamharia-Jamshedpur-plot_view.jpg', // Placeholder URLs
                'https://imagecdn.99acres.com/media1/28581/3/571623533M-1740149704743.webp'
            ]),
            startDate: new Date('2023-12-15'),
            completionDate: new Date('2025-12-31'),
            amenities: JSON.stringify([ // Sample data for amenities
                { "icon": "FaWater", "name": "24/7 Water Supply" },
                { "icon": "FaBatteryFull", "name": "Electricity Backup" },
                { "icon": "FaRecycle", "name": "Sewage Treatment Plant" },
                { "icon": "FaTree", "name": "Landscaped Gardens" }
            ]),
            landmarks: JSON.stringify([ // Sample data for landmarks
                { "icon": "FaPlane", "name": "Airport", "distance": "5 km" },
                { "icon": "FaHospital", "name": "Hospital", "distance": "3 km" },
                { "icon": "FaSchool", "name": "School", "distance": "2 km" }
            ]),
        });
        console.log('Sample Project created:', sampleProject2.toJSON());

        // --- Create Sample Plots for the Project ---
        await sequelize.models.Plot.bulkCreate([
            {
                project_id: sampleProject2.project_id,
                plot: '1',
                area: 1200,
                coordinates: JSON.stringify([
                    [0, 0], [30, 0], [30, 40], [0, 40],
                ]),
                status: 'sold',
                price: 5000000,
                facing: 'East',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '2',
                area: 1200,
                coordinates: JSON.stringify([
                    [0, 40], [30, 40], [30, 80], [0, 80],
                ]),
                status: 'available',
                price: 5000000,
                facing: 'West',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '3',
                area: 1200,
                coordinates: JSON.stringify([
                    [50, 0], [80, 0], [80, 40], [50, 40]
                ]),
                status: 'available',
                price: 5000000,
                facing: 'East',
            },
            {
                project_id: sampleProject2.project_id,
                plot: 'Common Hall',
                area: 1200,
                coordinates: JSON.stringify([
                    [50, 40], [80, 40], [80, 80], [50, 80]
                ]),
                status: 'other',
                price: 5000000,
                facing: 'East',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '5',
                area: 1600,
                coordinates: JSON.stringify([
                    [0, 80], [80, 80], [80, 100], [0, 100],
                ]),
                status: 'booked',
                price: 6000000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            // Add more sample plots
        ]);

        console.log('Database seeding complete.');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await sequelize.close();
        console.log('Database connection closed.');
    }
}

seedDatabase();
