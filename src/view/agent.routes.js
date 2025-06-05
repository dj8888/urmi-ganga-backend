import express from 'express';
import { addAgent, getAllAgents, updateAgent, deleteAgent, getAgentCodesWithNames } from '../controllers/agent.controller.js';
import { adminAuthMiddleware } from '../middleware/adminAuth.middleware.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

//Admin Protected Routes
router.get("/getAllAgents", adminAuthMiddleware, getAllAgents);
router.post("/addAgent", adminAuthMiddleware, addAgent);
//router.get("/check-phone", checkPhoneAvailability); // New route for checking phone number
router.put("/:agentId", adminAuthMiddleware, updateAgent);
router.delete("/:agentId", adminAuthMiddleware, deleteAgent);

//Normal Routes
router.get("/getAgentCodes", authMiddleware, getAgentCodesWithNames);

export default router;
