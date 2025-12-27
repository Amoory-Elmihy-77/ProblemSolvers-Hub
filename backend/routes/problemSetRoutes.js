import express from 'express';
import {
  getProblemSets,
  getProblemSetById,
  createProblemSet,
  updateProblemSet,
  deleteProblemSet,
  addProblemToSet,
} from '../controllers/problemSetController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getProblemSets)
  .post(protect, createProblemSet);

router.route('/:id')
  .get(protect, getProblemSetById)
  .put(protect, updateProblemSet)
  .delete(protect, deleteProblemSet);

router.patch('/:id/add-problem', protect, addProblemToSet);

export default router;
