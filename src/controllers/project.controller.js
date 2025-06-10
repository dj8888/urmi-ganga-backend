import { sequelize } from "../config/db.js"; // Import the Sequelize instance
import { Op } from 'sequelize'; // Import Op for advanced queries if needed (e.g., case-insensitive search)

const getAllProjects = async (req, res) => {
    try {
        const projects = await sequelize.models.Project.findAll({
            attributes: ['project_id', 'name', 'location', 'status', 'imageUrls'], // Select necessary attributes
        });

        // Process the results to extract only the first imageUrl
        const formattedProjects = projects.map(project => {
            const projectJson = project.toJSON(); // Get a plain JavaScript object

            let firstImageUrl = null;
            // Check if imageUrls is not null and is a string (as JSON is stored as text/string in DB)
            if (projectJson.imageUrls) {
                try {
                    // const imageUrlsArray = JSON.parse(projectJson.imageUrls);
                    const imageUrlsArray = projectJson.imageUrls;
                    if (Array.isArray(imageUrlsArray) && imageUrlsArray.length > 0) {
                        firstImageUrl = imageUrlsArray[0];
                    }
                } catch (e) {
                    console.error("Failed to parse imageUrls for project:", projectJson.project_id, e);
                    // Handle parsing error - perhaps log or set firstImageUrl to a default
                    // Have a default project image in the front end or backend to serve?
                }
            }


            return {
                project_id: projectJson.project_id,
                name: projectJson.name,
                location: projectJson.location,
                status: projectJson.status,
                image: firstImageUrl, // Include only the first image URL
            };
        });

        return res.status(200).json(formattedProjects);
    } catch (error) {
        console.error("Error fetching all projects:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const getProjectById = async (req, res) => {
    const projectId = req.params.projectId;
    try {
        const project = await sequelize.models.Project.findByPk(projectId, {
            include: [ // Include associated Plots
                {
                    model: sequelize.models.Plot,
                    attributes: [ // Select specific attributes from the Plot model
                        'plot_id',
                        'plot',
                        'coordinates',
                        'status',
                        'price',
                        'minimumBookingAmount',
                        'project_id', // Include foreign key if needed, though often implicit with include
                        'area',
                        'facing',
                    ],
                    // You can add a 'where' clause here if you only want to include certain plots
                },
            ],
            // If you only want specific project attributes, add an 'attributes' array here
            // attributes: ['project_id', 'name', 'location', ...]
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found." });
        }

        // Work with the Sequelize instance 'project' first

        // Parse coordinates for each plot directly on the included models
        // if (project.Plots && Array.isArray(project.Plots)) {
        //     project.Plots = project.Plots.map(plot => {
        //         // No need for plot.toJSON() here, plot is already a plain object or will be
        //         // converted later. We work directly with the properties.
        //         const plotData = { ...plot.get({ plain: true }) }; // Get plain data for the plot
        //
        //         if (plotData.coordinates) {
        //             try {
        //                 plotData.coordinates = JSON.parse(plotData.coordinates);
        //             } catch (e) {
        //                 console.error("Failed to parse coordinates for plot:", plotData.plot_id, e);
        //                 plotData.coordinates = null;
        //             }
        //         }
        //         return plotData; // Return the processed plain plot object
        //     });
        // }

        // Now, convert the main project object to JSON after modifying the Plots array

        // You might need to format the response data slightly to match your frontend's expectations
        // For example, parsing JSON strings like projectBoundary, imageUrls, amenities, landmarks

        const projectData = project.toJSON(); // Get a plain JavaScript object

        // Parse JSON strings
        // if (projectData.projectBoundary) {
        //     try {
        //         projectData.projectBoundary = JSON.parse(projectData.projectBoundary);
        //     } catch (e) {
        //         console.error("Failed to parse projectBoundary for project:", projectId, e);
        //         projectData.projectBoundary = null; // Set to null or handle as appropriate
        //     }
        // }
        // if (projectData.imageUrls) {
        //     try {
        //         projectData.imageUrls = JSON.parse(projectData.imageUrls);
        //     } catch (e) {
        //         console.error("Failed to parse imageUrls for project:", projectId, e);
        //         projectData.imageUrls = []; // Set to empty array or handle
        //     }
        // }
        // if (projectData.amenities) {
        //     try {
        //         projectData.amenities = JSON.parse(projectData.amenities);
        //     } catch (e) {
        //         console.error("Failed to parse amenities for project:", projectId, e);
        //         projectData.amenities = []; // Set to empty array or handle
        //     }
        // }
        // if (projectData.landmarks) {
        //     try {
        //         projectData.landmarks = JSON.parse(projectData.landmarks);
        //     } catch (e) {
        //         console.error("Failed to parse landmarks for project:", projectId, e);
        //         projectData.landmarks = []; // Set to empty array or handle
        //     }
        // }

        // Rename 'Plots' to something like 'plots' or 'plotData' if your frontend expects it
        projectData.plots = projectData.Plots;
        delete projectData.Plots; // Remove the original Sequelize generated key


        return res.status(200).json(projectData);
    } catch (error) {
        console.error("Error fetching project by ID with details:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// --- NEW CRUD Functions ---

const createProject = async (req, res) => {
    const { plots, ...projectData } = req.body; // Separate plots from project data
    const t = await sequelize.transaction(); // Start a transaction

    try {
        // Basic validation for required Project fields based on your model
        if (!projectData.name || !projectData.location || !projectData.startDate || !projectData.completionDate || !projectData.description || !projectData.projectBoundary) {
            await t.rollback();
            return res.status(400).json({ message: "Missing required project fields (name, location, start/completion dates, description, project boundary)." });
        }
        if (!projectData.imageUrls || !Array.isArray(projectData.imageUrls) || projectData.imageUrls.length === 0) {
            await t.rollback();
            return res.status(400).json({ message: "At least one imageUrl is required." });
        }

        // Sequelize automatically handles JSON/JSONB fields when you pass a JS array/object,
        // so no manual JSON.stringify() is needed here for projectData.

        // Create the project within the transaction
        const newProject = await sequelize.models.Project.create(projectData, { transaction: t });

        // Handle plots if provided
        if (plots && Array.isArray(plots) && plots.length > 0) {
            const plotInstances = plots.map(plot => {
                // Ensure plot has required fields as per your Plot model
                // Note: 'area', 'facing', 'googleMapsUrl' are not explicitly required by models
                // but 'plot', 'coordinates', 'price', 'minimumBookingAmount' are.
                if (!plot.plot || !plot.coordinates || !plot.price || plot.minimumBookingAmount === undefined) {
                    throw new Error("Missing required plot fields (plot, coordinates, price, minimumBookingAmount).");
                }
                // Sequelize automatically handles JSON/JSONB fields,
                // so no manual JSON.stringify() for plot.coordinates.
                return {
                    ...plot,
                    project_id: newProject.project_id, // Link to the newly created project
                };
            });
            await sequelize.models.Plot.bulkCreate(plotInstances, { transaction: t });
        }

        await t.commit(); // Commit the transaction if all operations succeed

        // Fetch the newly created project with its plots to return a complete object
        // Sequelize automatically parses JSON/JSONB fields from DB into JS objects/arrays
        const createdProjectWithPlots = await sequelize.models.Project.findByPk(newProject.project_id, {
            include: [{ model: sequelize.models.Plot }],
        });

        const projectJson = createdProjectWithPlots.toJSON();

        // Rename 'Plots' to 'plots' for consistency in the response
        projectJson.plots = projectJson.Plots;
        delete projectJson.Plots;

        return res.status(201).json(projectJson); // 201 Created
    } catch (error) {
        await t.rollback(); // Rollback transaction on error
        console.error("Error creating project:", error);
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: error.errors.map(err => err.message).join(', ') });
        } else if (error.message.includes("Missing required plot fields")) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal Server Error during project creation." });
    }
};

const updateProject = async (req, res) => {
    const projectId = req.params.projectId;
    // Destructure specific plot operations from the body
    const { plotsToUpdate, plotsToAdd, plotIdsToDelete, ...projectData } = req.body;

    const t = await sequelize.transaction(); // Start a transaction

    try {
        const project = await sequelize.models.Project.findByPk(projectId, { transaction: t });

        if (!project) {
            await t.rollback();
            return res.status(404).json({ message: "Project not found." });
        }

        // Update the project's own fields. Sequelize handles JSON/JSONB fields.
        // `projectData` should contain plain JS values (strings, numbers, arrays, objects).
        await project.update(projectData, { transaction: t });

        // 1. Delete Plots
        if (plotIdsToDelete && Array.isArray(plotIdsToDelete) && plotIdsToDelete.length > 0) {
            await sequelize.models.Plot.destroy({
                where: {
                    plot_id: plotIdsToDelete,
                    project_id: projectId // Crucial: ensure plots belong to this project
                },
                transaction: t
            });
        }

        // 2. Add new Plots
        if (plotsToAdd && Array.isArray(plotsToAdd) && plotsToAdd.length > 0) {
            const newPlotInstances = plotsToAdd.map(plot => {
                // Basic validation for new plots, consistent with createProject
                if (!plot.plot || !plot.coordinates || !plot.price || plot.minimumBookingAmount === undefined) {
                    throw new Error("Missing required fields for new plot (plot, coordinates, price, minimumBookingAmount).");
                }
                // Sequelize handles JSON/JSONB fields for plot.coordinates automatically.
                return {
                    ...plot,
                    project_id: projectId, // Link to the current project
                };
            });
            await sequelize.models.Plot.bulkCreate(newPlotInstances, { transaction: t });
        }

        // 3. Update existing Plots
        if (plotsToUpdate && Array.isArray(plotsToUpdate) && plotsToUpdate.length > 0) {
            for (const plot of plotsToUpdate) {
                if (!plot.plot_id) {
                    throw new Error("Missing plot_id for plot update. Cannot update plot without ID.");
                }
                const existingPlot = await sequelize.models.Plot.findByPk(plot.plot_id, { transaction: t });
                // Ensure the plot exists and belongs to the current project
                if (existingPlot && existingPlot.project_id === parseInt(projectId, 10)) {
                    // Sequelize handles JSON/JSONB fields for plot.coordinates automatically.
                    await existingPlot.update(plot, { transaction: t });
                } else {
                    console.warn(`Plot ${plot.plot_id} not found or does not belong to project ${projectId}. Skipping update.`);
                    // Optionally, you could throw an error here if you want strict updates
                }
            }
        }

        await t.commit(); // Commit the transaction

        // Fetch the updated project with its plots to return a complete object
        // Sequelize automatically parses JSON/JSONB fields from DB into JS objects/arrays
        const updatedProjectWithPlots = await sequelize.models.Project.findByPk(projectId, {
            include: [{ model: sequelize.models.Plot }],
        });

        const projectJson = updatedProjectWithPlots.toJSON();

        // Rename 'Plots' to 'plots' for consistency
        projectJson.plots = projectJson.Plots;
        delete projectJson.Plots;

        return res.status(200).json(projectJson); // 200 OK
    } catch (error) {
        await t.rollback(); // Rollback transaction on error
        console.error("Error updating project:", error);
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: error.errors.map(err => err.message).join(', ') });
        } else if (error.message.includes("Missing required fields for new plot") || error.message.includes("Missing plot_id for plot update")) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: "Internal Server Error during project update." });
    }
};

const deleteProject = async (req, res) => {
    const projectId = req.params.projectId;
    const t = await sequelize.transaction(); // Start a transaction

    try {
        // Find the project first to ensure it exists
        const project = await sequelize.models.Project.findByPk(projectId, { transaction: t });

        if (!project) {
            await t.rollback();
            return res.status(404).json({ message: "Project not found." });
        }

        // Sequelize's onDelete: 'CASCADE' in the association definition
        // (Project.hasMany(models.Plot, { foreignKey: 'project_id', onDelete: 'CASCADE' }))
        // will automatically delete associated plots when the project is destroyed.
        const deletedRows = await project.destroy({ transaction: t });
        console.log(`Project with ID:${projectId} deleted by admin.`);

        if (deletedRows === 0) { // Should not happen if project was found above, but good for robustness
            await t.rollback();
            return res.status(404).json({ message: "Project not found or already deleted." });
        }

        await t.commit(); // Commit the transaction
        return res.status(200).json({ message: "Project and associated plots deleted successfully." });

    } catch (error) {
        await t.rollback(); // Rollback transaction on error
        console.error("Error deleting project:", error);
        return res.status(500).json({ error: "Internal Server Error during project deletion." });
    }
};

export {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
};
