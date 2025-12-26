import asyncHandler from 'express-async-handler';
import UserBookmark from '../models/UserBookmark.js';

// @desc    Get user's bookmarks
// @route   GET /api/bookmarks
// @access  Private
export const getUserBookmarks = asyncHandler(async (req, res) => {
  const bookmarks = await UserBookmark.find({ user: req.user._id })
    .populate('problem')
    .sort({ createdAt: -1 });

  res.json(bookmarks);
});

// @desc    Add bookmark
// @route   POST /api/bookmarks
// @access  Private
export const addBookmark = asyncHandler(async (req, res) => {
  const { problemId } = req.body;

  // Check if already bookmarked
  const existing = await UserBookmark.findOne({
    user: req.user._id,
    problem: problemId,
  });

  if (existing) {
    res.status(400);
    throw new Error('Problem already bookmarked');
  }

  const bookmark = await UserBookmark.create({
    user: req.user._id,
    problem: problemId,
  });

  const populatedBookmark = await UserBookmark.findById(bookmark._id).populate(
    'problem'
  );

  res.status(201).json(populatedBookmark);
});

// @desc    Remove bookmark
// @route   DELETE /api/bookmarks/:problemId
// @access  Private
export const removeBookmark = asyncHandler(async (req, res) => {
  const bookmark = await UserBookmark.findOne({
    user: req.user._id,
    problem: req.params.problemId,
  });

  if (bookmark) {
    await bookmark.deleteOne();
    res.json({ message: 'Bookmark removed' });
  } else {
    res.status(404);
    throw new Error('Bookmark not found');
  }
});
