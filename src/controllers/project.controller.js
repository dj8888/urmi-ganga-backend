import { sequelize } from "../config/db.js"; // Import the Sequelize instance

export const getAllProjects = async (req, res) => {
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
                    const imageUrlsArray = JSON.parse(projectJson.imageUrls);
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

export const getProjectById = async (req, res) => {
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
                        'project_id' // Include foreign key if needed, though often implicit with include
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
        if (project.Plots && Array.isArray(project.Plots)) {
            project.Plots = project.Plots.map(plot => {
                // No need for plot.toJSON() here, plot is already a plain object or will be
                // converted later. We work directly with the properties.
                const plotData = { ...plot.get({ plain: true }) }; // Get plain data for the plot

                if (plotData.coordinates) {
                    try {
                        plotData.coordinates = JSON.parse(plotData.coordinates);
                    } catch (e) {
                        console.error("Failed to parse coordinates for plot:", plotData.plot_id, e);
                        plotData.coordinates = null;
                    }
                }
                return plotData; // Return the processed plain plot object
            });
        }

        // Now, convert the main project object to JSON after modifying the Plots array

        // You might need to format the response data slightly to match your frontend's expectations
        // For example, parsing JSON strings like projectBoundary, imageUrls, amenities, landmarks

        const projectData = project.toJSON(); // Get a plain JavaScript object

        // Parse JSON strings
        if (projectData.projectBoundary) {
            try {
                projectData.projectBoundary = JSON.parse(projectData.projectBoundary);
            } catch (e) {
                console.error("Failed to parse projectBoundary for project:", projectId, e);
                projectData.projectBoundary = null; // Set to null or handle as appropriate
            }
        }
        if (projectData.imageUrls) {
            try {
                projectData.imageUrls = JSON.parse(projectData.imageUrls);
            } catch (e) {
                console.error("Failed to parse imageUrls for project:", projectId, e);
                projectData.imageUrls = []; // Set to empty array or handle
            }
        }
        if (projectData.amenities) {
            try {
                projectData.amenities = JSON.parse(projectData.amenities);
            } catch (e) {
                console.error("Failed to parse amenities for project:", projectId, e);
                projectData.amenities = []; // Set to empty array or handle
            }
        }
        if (projectData.landmarks) {
            try {
                projectData.landmarks = JSON.parse(projectData.landmarks);
            } catch (e) {
                console.error("Failed to parse landmarks for project:", projectId, e);
                projectData.landmarks = []; // Set to empty array or handle
            }
        }

        // Rename 'Plots' to something like 'plots' or 'plotData' if your frontend expects it
        projectData.plots = projectData.Plots;
        delete projectData.Plots; // Remove the original Sequelize generated key


        return res.status(200).json(projectData);
    } catch (error) {
        console.error("Error fetching project by ID with details:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};



// export const addProject = async (req, res) => {
//     try {
//         const { name, location, totalArea, layoutData } = req.body;
//         if (!name) {
//             return res.status(400).json({ error: "Project name is required." });
//         }
//         const newProject = await sequelize.models.Project.create({
//             name,
//             location,
//             totalArea,
//             layoutData,
//         });
//         return res.status(201).json(newProject);
//     } catch (error) {
//         console.error("Error adding project:", error);
//         return res.status(500).json({ error: "Internal Server Error" });
//     }
// };
//
// export const getAllProjects = async (req, res) => {
//     try {
//         const projects = await sequelize.models.Project.findAll(
//             { attributes: ['name', 'location'], }
//         );
//         return res.status(200).json(projects);
//     } catch (error) {
//         console.error("Error fetching all projects:", error);
//         return res.status(500).json({ error: "Internal Server Error" });
//     }
// };
//
// export const getProjectById = async (req, res) => {
//     const projectId = req.params.projectId;
//     try {
//         const project = await sequelize.models.Project.findByPk(projectId);
//         if (!project) {
//             return res.status(404).json({ message: "Project not found." });
//         }
//         return res.status(200).json(project);
//     } catch (error) {
//         console.error("Error fetching project by ID:", error);
//         return res.status(500).json({ error: "Internal Server Error" });
//     }
// };
//
// export const updateProject = async (req, res) => {
//     const projectId = req.params.projectId;
//     try {
//         const [updated] = await sequelize.models.Project.update(req.body, {
//             where: { project_id: projectId },
//         });
//         if (updated === 0) {
//             return res.status(404).json({ message: "Project not found." });
//         }
//         const updatedProject = await sequelize.models.Project.findByPk(projectId);
//         return res.status(200).json({ message: "Project updated successfully.", project: updatedProject });
//     } catch (error) {
//         console.error("Error updating project:", error);
//         return res.status(500).json({ error: "Internal Server Error" });
//     }
// };
//
// export const deleteProject = async (req, res) => {
//     const projectId = req.params.projectId;
//     try {
//         const deleted = await sequelize.models.Project.destroy({
//             where: { project_id: projectId },
//         });
//         if (deleted === 0) {
//             return res.status(404).json({ message: "Project not found." });
//         }
//         return res.status(204).send(); // 204 No Content for successful deletion
//     } catch (error) {
//         console.error("Error deleting project:", error);
//         return res.status(500).json({ error: "Internal Server Error" });
//     }
// };
