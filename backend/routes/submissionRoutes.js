import express from 'express';
import {
  getSubmissionsByProblem,
  createSubmission,
  markAsReference,
} from '../controllers/submissionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', protect, createSubmission);
router.get('/problem/:problemId', protect, getSubmissionsByProblem);
router.put('/:id/reference', protect, adminOnly, markAsReference);

export default router;
