import express from 'express';
//import {
//    addUser,
//    getAllUsers,
//    getUserById,
//    updateUser,
//    deleteUser,
//} from '../controllers/user.controller.js';
import { syncUserToDatabase } from '../controllers/user.controller.js';

const router = express.Router();

router.post("/sync", syncUserToDatabase);
//router.post('/', addUser);
//router.get('/', getAllUsers);
//router.get('/:userId', getUserById);
//router.put('/:userId', updateUser);
//router.delete('/:userId', deleteUser);

export default router;
