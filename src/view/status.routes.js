import express from 'express';
import { keepawake } from '../controllers/keepawake.controller.js';


const router = express.Router();

//Admin Protected Routes
router.get("/ping", keepawake);

export default router;
