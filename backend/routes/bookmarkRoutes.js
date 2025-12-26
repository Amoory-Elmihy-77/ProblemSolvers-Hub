import express from 'express';
import {
  getUserBookmarks,
  addBookmark,
  removeBookmark,
} from '../controllers/bookmarkController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getUserBookmarks)
  .post(protect, addBookmark);

router.delete('/:problemId', protect, removeBookmark);

export default router;
