import express from 'express';
import { addAgent, getAllAgents, updateAgent, deleteAgent } from '../controllers/agent.controller.js';
import verifyClerkAdminToken from '../middleware/verifyClerkAdminToken.js';

const router = express.Router();

router.get("/getAllAgents", verifyClerkAdminToken, getAllAgents);

router.post("/addAgent", verifyClerkAdminToken, addAgent);
//router.get("/check-phone", checkPhoneAvailability); // New route for checking phone number
router.put("/:agentId", verifyClerkAdminToken, updateAgent);
router.delete("/:agentId", verifyClerkAdminToken, deleteAgent);

export default router;
