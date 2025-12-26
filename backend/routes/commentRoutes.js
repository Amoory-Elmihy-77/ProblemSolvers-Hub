import express from 'express';
import {
  getCommentsByProblem,
  createComment,
  deleteComment,
} from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createComment);
router.get('/problem/:problemId', protect, getCommentsByProblem);
router.delete('/:id', protect, deleteComment);

export default router;
