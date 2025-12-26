import asyncHandler from 'express-async-handler';
import Comment from '../models/Comment.js';

// @desc    Get all comments for a problem
// @route   GET /api/comments/problem/:problemId
// @access  Private
export const getCommentsByProblem = asyncHandler(async (req, res) => {
  const comments = await Comment.find({
    problem: req.params.problemId,
  })
    .populate('user', 'name email')
    .sort({ createdAt: 1 }); // Oldest first for chronological discussion

  res.json(comments);
});

// @desc    Create new comment
// @route   POST /api/comments
// @access  Private
export const createComment = asyncHandler(async (req, res) => {
  const { problem, content } = req.body;

  const comment = await Comment.create({
    problem,
    user: req.user._id,
    content,
  });

  const populatedComment = await Comment.findById(comment._id)
    .populate('user', 'name email')
    .populate('problem', 'title');

  res.status(201).json(populatedComment);
});

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (own comment or admin)
export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (comment) {
    // Check if user is the comment owner or admin
    if (
      comment.user.toString() === req.user._id.toString() ||
      req.user.role === 'Admin'
    ) {
      await comment.deleteOne();
      res.json({ message: 'Comment removed' });
    } else {
      res.status(403);
      throw new Error('Not authorized to delete this comment');
    }
  } else {
    res.status(404);
    throw new Error('Comment not found');
  }
});
