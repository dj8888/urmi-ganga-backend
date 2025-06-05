// seeders/initial-data.js
import { sequelize, connection } from '../src/config/db.js'; // Import sequelize and connection

async function seedDatabase() {
    try {
        console.log('Connecting to database and loading models for seeding...');
        await connection();
        console.log('Database connected and models loaded.');

        console.log('Starting database seeding...');

        // --- Create a Sample Project ---
        const sampleProject2 = await sequelize.models.Project.create({
            name: 'Ranchi Royal Residency',
            location: 'Near Airport Road, Ranchi',
            totalArea: 41000, // in square units (e.g., sq ft)
            projectBoundary: [
                [0, 0], [410, 0], [410, 100], [0, 100] // Example coordinates for a rectangular boundary
            ],
            googleMapsUrl: 'https://maps.app.goo.gl/your_Maps_pin_url', // Replace with a real URL
            description: 'A premium residential project located strategically with excellent connectivity.', // Main description
            status: 'completed',
            imageUrls: [
                'https://imganuncios.mitula.net/residential_plot_in_pithauriya_for_resale_ranchi_the_reference_number_is_16928944_1100001743768802379.jpg', // Placeholder URLs
            ],
            startDate: new Date('2023-10-15'),
            completionDate: new Date('2025-12-31'),
            amenities: [ // Sample data for amenities
                { "icon": "FaWater", "name": "24/7 Water Supply" },
                { "icon": "FaBatteryFull", "name": "Electricity Backup" },
                { "icon": "FaRecycle", "name": "Sewage Treatment Plant" },
                { "icon": "FaTree", "name": "Landscaped Gardens" }
            ],
            landmarks: [ // Sample data for landmarks
                { "icon": "FaPlane", "name": "Airport", "distance": "5 km" },
                { "icon": "FaHospital", "name": "Hospital", "distance": "3 km" },
                { "icon": "FaSchool", "name": "School", "distance": "2 km" }
            ],
        });
        console.log('Sample Project created:', sampleProject2.toJSON());

        // --- Create Sample Plots for the Project ---
        await sequelize.models.Plot.bulkCreate([
            //Plots 1-10
            {
                project_id: sampleProject2.project_id,
                plot: '1',
                area: 600,
                coordinates: [
                    [0, 0], [20, 0], [20, 30], [0, 30],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '2',
                area: 600,
                coordinates: [
                    [20, 0], [40, 0], [40, 30], [20, 30],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '3',
                area: 600,
                coordinates: [
                    [40, 0], [60, 0], [60, 30], [40, 30],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '4',
                area: 600,
                coordinates: [
                    [60, 0], [80, 0], [80, 30], [60, 30],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '5',
                area: 600,
                coordinates: [
                    [80, 0], [100, 0], [100, 30], [80, 30],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '6',
                area: 600,
                coordinates: [
                    [100, 0], [120, 0], [120, 30], [100, 30],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '7',
                area: 600,
                coordinates: [
                    [120, 0], [140, 0], [140, 30], [120, 30],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '8',
                area: 600,
                coordinates: [
                    [140, 0], [160, 0], [160, 30], [140, 30],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '9',
                area: 600,
                coordinates: [
                    [160, 0], [180, 0], [180, 30], [160, 30],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '10',
                area: 600,
                coordinates: [
                    [180, 0], [200, 0], [200, 30], [180, 30],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            //Plots 11-20
            {
                project_id: sampleProject2.project_id,
                plot: '11',
                area: 600,
                coordinates: [
                    [210, 0], [230, 0], [230, 30], [210, 30],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '12',
                area: 600,
                coordinates: [
                    [230, 0], [250, 0], [250, 30], [230, 30],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '13',
                area: 600,
                coordinates: [
                    [250, 0], [270, 0], [270, 30], [250, 30],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '14',
                area: 600,
                coordinates: [
                    [270, 0], [290, 0], [290, 30], [270, 30],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '15',
                area: 600,
                coordinates: [
                    [290, 0], [310, 0], [310, 30], [290, 30],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '16',
                area: 600,
                coordinates: [
                    [310, 0], [330, 0], [330, 30], [310, 30],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '17',
                area: 600,
                coordinates: [
                    [330, 0], [350, 0], [350, 30], [330, 30],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '18',
                area: 600,
                coordinates: [
                    [350, 0], [370, 0], [370, 30], [350, 30],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '19',
                area: 600,
                coordinates: [
                    [370, 0], [390, 0], [390, 30], [370, 30],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '20',
                area: 600,
                coordinates: [
                    [390, 0], [410, 0], [410, 30], [390, 30],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            //Plots 21-30
            {
                project_id: sampleProject2.project_id,
                plot: '21',
                area: 600,
                coordinates: [
                    [0, 30], [20, 30], [20, 60], [0, 60],
                ],
                status: 'available',
                price: 600000,
                facing: 'South',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '22',
                area: 600,
                coordinates: [
                    [20, 30], [40, 30], [40, 60], [20, 60],
                ],
                status: 'available',
                price: 600000,
                facing: 'South',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '23',
                area: 600,
                coordinates: [
                    [40, 30], [60, 30], [60, 60], [40, 60],
                ],
                status: 'available',
                price: 600000,
                facing: 'South',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '24',
                area: 600,
                coordinates: [
                    [60, 30], [80, 30], [80, 60], [60, 60],
                ],
                status: 'available',
                price: 600000,
                facing: 'South',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '25',
                area: 600,
                coordinates: [
                    [80, 30], [100, 30], [100, 60], [80, 60],
                ],
                status: 'available',
                price: 600000,
                facing: 'South',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '26',
                area: 600,
                coordinates: [
                    [100, 30], [120, 30], [120, 60], [100, 60],
                ],
                status: 'available',
                price: 600000,
                facing: 'South',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '27',
                area: 600,
                coordinates: [
                    [120, 30], [140, 30], [140, 60], [120, 60],
                ],
                status: 'available',
                price: 600000,
                facing: 'South',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '28',
                area: 600,
                coordinates: [
                    [140, 30], [160, 30], [160, 60], [140, 60],
                ],
                status: 'available',
                price: 600000,
                facing: 'South',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '29',
                area: 600,
                coordinates: [
                    [160, 30], [180, 30], [180, 60], [160, 60],
                ],
                status: 'available',
                price: 600000,
                facing: 'South',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: 'Park',
                area: 600,
                coordinates: [
                    [180, 30], [200, 30], [200, 60], [180, 60],
                ],
                status: 'park',
                price: 600000,
                facing: 'South',
                minimumBookingAmount: 500
            },
            //Plots 31-40
            {
                project_id: sampleProject2.project_id,
                plot: '31',
                area: 600,
                coordinates: [
                    [210, 30], [230, 30], [230, 60], [210, 60],
                ],
                status: 'available',
                price: 600000,
                facing: 'South',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '32',
                area: 600,
                coordinates: [
                    [230, 30], [250, 30], [250, 60], [230, 60],
                ],
                status: 'available',
                price: 600000,
                facing: 'South',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '33',
                area: 600,
                coordinates: [
                    [250, 30], [270, 30], [270, 60], [250, 60],
                ],
                status: 'available',
                price: 600000,
                facing: 'South',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '34',
                area: 600,
                coordinates: [
                    [270, 30], [290, 30], [290, 60], [270, 60],
                ],
                status: 'available',
                price: 600000,
                facing: 'South',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '35',
                area: 600,
                coordinates: [
                    [290, 30], [310, 30], [310, 60], [290, 60],
                ],
                status: 'available',
                price: 600000,
                facing: 'South',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '36',
                area: 600,
                coordinates: [
                    [310, 30], [330, 30], [330, 60], [310, 60],
                ],
                status: 'available',
                price: 600000,
                facing: 'South',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '37',
                area: 600,
                coordinates: [
                    [330, 30], [350, 30], [350, 60], [330, 60],
                ],
                status: 'available',
                price: 600000,
                facing: 'South',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '38',
                area: 600,
                coordinates: [
                    [350, 30], [370, 30], [370, 60], [350, 60],
                ],
                status: 'available',
                price: 600000,
                facing: 'South',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '39',
                area: 600,
                coordinates: [
                    [370, 30], [390, 30], [390, 60], [370, 60],
                ],
                status: 'available',
                price: 600000,
                facing: 'South',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '40',
                area: 600,
                coordinates: [
                    [390, 30], [410, 30], [410, 60], [390, 60],
                ],
                status: 'available',
                price: 600000,
                facing: 'South',
                minimumBookingAmount: 500
            },
            //Plots 41-50
            {
                project_id: sampleProject2.project_id,
                plot: '41',
                area: 600,
                coordinates: [
                    [0, 70], [20, 70], [20, 100], [0, 100],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '42',
                area: 600,
                coordinates: [
                    [20, 70], [40, 70], [40, 100], [20, 100],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '43',
                area: 600,
                coordinates: [
                    [40, 70], [60, 70], [60, 100], [40, 100],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '44',
                area: 600,
                coordinates: [
                    [60, 70], [80, 70], [80, 100], [60, 100],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '45',
                area: 600,
                coordinates: [
                    [80, 70], [100, 70], [100, 100], [80, 100],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '46',
                area: 600,
                coordinates: [
                    [100, 70], [120, 70], [120, 100], [100, 100],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '47',
                area: 600,
                coordinates: [
                    [120, 70], [140, 70], [140, 100], [120, 100],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '48',
                area: 600,
                coordinates: [
                    [140, 70], [160, 70], [160, 100], [140, 100],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '49',
                area: 600,
                coordinates: [
                    [160, 70], [180, 70], [180, 100], [160, 100],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '50',
                area: 600,
                coordinates: [
                    [180, 70], [200, 70], [200, 100], [180, 100],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            //Pots 51-60
            {
                project_id: sampleProject2.project_id,
                plot: 'Hall',
                area: 600,
                coordinates: [
                    [210, 70], [230, 70], [230, 100], [210, 100],
                ],
                status: 'other',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '52',
                area: 600,
                coordinates: [
                    [230, 70], [250, 70], [250, 100], [230, 100],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '53',
                area: 600,
                coordinates: [
                    [250, 70], [270, 70], [270, 100], [250, 100],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '54',
                area: 600,
                coordinates: [
                    [270, 70], [290, 70], [290, 100], [270, 100],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '55',
                area: 600,
                coordinates: [
                    [290, 70], [310, 70], [310, 100], [290, 100],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '56',
                area: 600,
                coordinates: [
                    [310, 70], [330, 70], [330, 100], [310, 100],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '57',
                area: 600,
                coordinates: [
                    [330, 70], [350, 70], [350, 100], [330, 100],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '58',
                area: 600,
                coordinates: [
                    [350, 70], [370, 70], [370, 100], [350, 100],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '59',
                area: 600,
                coordinates: [
                    [370, 70], [390, 70], [390, 100], [370, 100],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject2.project_id,
                plot: '60',
                area: 600,
                coordinates: [
                    [390, 70], [410, 70], [410, 100], [390, 100],
                ],
                status: 'available',
                price: 600000,
                facing: 'North',
                minimumBookingAmount: 500
            },
        ]);

        // --- Create a Sample Project ---
        const sampleProject = await sequelize.models.Project.create({
            name: 'Sample Project 1',
            location: 'Ratu Road',
            totalArea: 150000, // in square units (e.g., sq ft)
            projectBoundary: [
                [0, 0], [80, 0], [80, 100], [0, 100]
            ],
            googleMapsUrl: 'https://maps.app.goo.gl/your_Maps_pin_url', // Replace with a real URL
            description: 'A premium residential project located strategically with excellent connectivity.', // Main description
            status: 'booking_ongoing',
            imageUrls: [
                'https://housing-images.n7net.in/01c16c28/3950dfb5f7f0221c1e84d31f5324224d/v0/large/residential_plot-for-sale-gamharia-Jamshedpur-plot_view.jpg', // Placeholder URLs
                'https://imagecdn.99acres.com/media1/28581/3/571623533M-1740149704743.webp'
            ],
            startDate: new Date('2023-12-15'),
            completionDate: new Date('2025-12-31'),
            amenities: [ // Sample data for amenities
                { "icon": "FaWater", "name": "24/7 Water Supply" },
                { "icon": "FaBatteryFull", "name": "Electricity Backup" },
                { "icon": "FaRecycle", "name": "Sewage Treatment Plant" },
                { "icon": "FaTree", "name": "Landscaped Gardens" }
            ],
            landmarks: [ // Sample data for landmarks
                { "icon": "FaPlane", "name": "Airport", "distance": "5 km" },
                { "icon": "FaHospital", "name": "Hospital", "distance": "3 km" },
                { "icon": "FaSchool", "name": "School", "distance": "2 km" }
            ],
        });
        console.log('Sample Project created:', sampleProject.toJSON());

        // --- Create Sample Plots for the Project ---
        await sequelize.models.Plot.bulkCreate([
            {
                project_id: sampleProject.project_id,
                plot: '1',
                area: 1200,
                coordinates: [
                    [0, 0], [30, 0], [30, 40], [0, 40],
                ],
                status: 'sold',
                price: 5000000,
                facing: 'East',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject.project_id,
                plot: '2',
                area: 1200,
                coordinates: [
                    [0, 40], [30, 40], [30, 80], [0, 80],
                ],
                status: 'available',
                price: 5000000,
                facing: 'West',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject.project_id,
                plot: '3',
                area: 1200,
                coordinates: [
                    [50, 0], [80, 0], [80, 40], [50, 40]
                ],
                status: 'available',
                price: 5000000,
                facing: 'East',
            },
            {
                project_id: sampleProject.project_id,
                plot: 'Common Hall',
                area: 1200,
                coordinates: [
                    [50, 40], [80, 40], [80, 80], [50, 80]
                ],
                status: 'other',
                price: 5000000,
                facing: 'East',
                minimumBookingAmount: 500
            },
            {
                project_id: sampleProject.project_id,
                plot: '5',
                area: 1600,
                coordinates: [
                    [0, 80], [80, 80], [80, 100], [0, 100],
                ],
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
