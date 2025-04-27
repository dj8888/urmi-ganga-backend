import { sequelize } from "../config/db.js"; // Import the Sequelize instance


export const addProject = async (req, res) => {
    try {
        const { name, location, totalArea, layoutData } = req.body;
        if (!name) {
            return res.status(400).json({ error: "Project name is required." });
        }
        const newProject = await sequelize.models.Project.create({
            name,
            location,
            totalArea,
            layoutData,
        });
        return res.status(201).json(newProject);
    } catch (error) {
        console.error("Error adding project:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getAllProjects = async (req, res) => {
    try {
        const projects = await sequelize.models.Project.findAll(
            { attributes: ['name', 'location'], }
        );
        return res.status(200).json(projects);
    } catch (error) {
        console.error("Error fetching all projects:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const getProjectById = async (req, res) => {
    const projectId = req.params.projectId;
    try {
        const project = await sequelize.models.Project.findByPk(projectId);
        if (!project) {
            return res.status(404).json({ message: "Project not found." });
        }
        return res.status(200).json(project);
    } catch (error) {
        console.error("Error fetching project by ID:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const updateProject = async (req, res) => {
    const projectId = req.params.projectId;
    try {
        const [updated] = await sequelize.models.Project.update(req.body, {
            where: { project_id: projectId },
        });
        if (updated === 0) {
            return res.status(404).json({ message: "Project not found." });
        }
        const updatedProject = await sequelize.models.Project.findByPk(projectId);
        return res.status(200).json({ message: "Project updated successfully.", project: updatedProject });
    } catch (error) {
        console.error("Error updating project:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deleteProject = async (req, res) => {
    const projectId = req.params.projectId;
    try {
        const deleted = await sequelize.models.Project.destroy({
            where: { project_id: projectId },
        });
        if (deleted === 0) {
            return res.status(404).json({ message: "Project not found." });
        }
        return res.status(204).send(); // 204 No Content for successful deletion
    } catch (error) {
        console.error("Error deleting project:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
