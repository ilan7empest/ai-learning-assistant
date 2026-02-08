import express from 'express';
import { getDashboard } from '../components/progress/progress.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/dashboard', getDashboard);

export default router;
