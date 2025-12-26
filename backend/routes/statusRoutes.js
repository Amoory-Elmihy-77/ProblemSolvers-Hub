import express from 'express';
import {
  toggleReadStatus,
  getMyReadStatuses,
} from '../controllers/statusController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my-read', protect, getMyReadStatuses);
router.post('/toggle-read', protect, toggleReadStatus);

export default router;
