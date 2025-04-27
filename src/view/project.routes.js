import express from 'express';
import { addProject, getAllProjects, getProjectById, updateProject, deleteProject } from '../controllers/project.controller.js';

const router = express.Router();

router.post('/', addProject);
router.get('/', getAllProjects);
router.get('/:projectId', getProjectById);
router.put('/:projectId', updateProject);
router.delete('/:projectId', deleteProject);

export default router;
