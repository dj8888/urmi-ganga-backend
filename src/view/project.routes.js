import express from 'express';
// import { addProject, getAllProjects, getProjectById, updateProject, deleteProject } from '../controllers/project.controller.js';
import { adminAuthMiddleware } from '../middleware/adminAuth.middleware.js';
import {
    getAllProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject
} from '../controllers/project.controller.js';

const router = express.Router();

router.get('/', getAllProjects);
router.get('/:projectId', getProjectById);
router.post('/', adminAuthMiddleware, createProject);
router.put('/:projectId', adminAuthMiddleware, updateProject);
router.delete('/:projectId', adminAuthMiddleware, deleteProject);

export default router;
