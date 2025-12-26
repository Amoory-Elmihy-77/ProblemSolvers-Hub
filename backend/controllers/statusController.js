import asyncHandler from 'express-async-handler';
import ProblemStatus from '../models/ProblemStatus.js';

// @desc    Toggle problem read status
// @route   POST /api/status/toggle-read
// @access  Private
export const toggleReadStatus = asyncHandler(async (req, res) => {
  const { problemId } = req.body;

  if (!problemId) {
    res.status(400);
    throw new Error('Problem ID is required');
  }

  const existingStatus = await ProblemStatus.findOne({
    user: req.user._id,
    problem: problemId,
  });

  if (existingStatus) {
    await existingStatus.deleteOne();
    res.json({ message: 'Problem marked as unread', isRead: false });
  } else {
    await ProblemStatus.create({
      user: req.user._id,
      problem: problemId,
      isRead: true,
    });
    res.status(201).json({ message: 'Problem marked as read', isRead: true });
  }
});

// @desc    Get all problems marked as read by current user
// @route   GET /api/status/my-read
// @access  Private
export const getMyReadStatuses = asyncHandler(async (req, res) => {
  const statuses = await ProblemStatus.find({ user: req.user._id });
  const readProblemIds = statuses.map((s) => s.problem);
  res.json(readProblemIds);
});
