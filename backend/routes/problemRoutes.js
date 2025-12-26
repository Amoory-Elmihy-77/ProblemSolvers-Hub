import express from 'express';
import {
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
} from '../controllers/problemController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require authentication
router.route('/')
  .get(protect, getProblems)
  .post(protect, createProblem);

router.route('/:id')
  .get(protect, getProblemById)
  .put(protect, updateProblem)
  .delete(protect, deleteProblem);

export default router;
