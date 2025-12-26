import asyncHandler from 'express-async-handler';
import Submission from '../models/Submission.js';

// @desc    Get all submissions for a problem
// @route   GET /api/submissions/problem/:problemId
// @access  Private
export const getSubmissionsByProblem = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({
    problem: req.params.problemId,
  })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  res.json(submissions);
});

// @desc    Create new submission
// @route   POST /api/submissions
// @access  Private
export const createSubmission = asyncHandler(async (req, res) => {
  const {
    problem,
    approach,
    thoughtProcess,
    pseudocode,
    code,
    timeComplexity,
    spaceComplexity,
    optimizationNotes,
  } = req.body;

  const submission = await Submission.create({
    problem,
    user: req.user._id,
    approach,
    thoughtProcess,
    pseudocode,
    code,
    timeComplexity,
    spaceComplexity,
    optimizationNotes,
  });

  const populatedSubmission = await Submission.findById(submission._id)
    .populate('user', 'name email')
    .populate('problem', 'title');

  res.status(201).json(populatedSubmission);
});

// @desc    Mark submission as reference solution
// @route   PUT /api/submissions/:id/reference
// @access  Private/Admin
export const markAsReference = asyncHandler(async (req, res) => {
  const submission = await Submission.findById(req.params.id);

  if (submission) {
    // First, unmark any existing reference solution for this problem
    await Submission.updateMany(
      { problem: submission.problem },
      { isReferenceSolution: false }
    );

    // Mark this submission as reference
    submission.isReferenceSolution = true;
    const updatedSubmission = await submission.save();

    res.json(updatedSubmission);
  } else {
    res.status(404);
    throw new Error('Submission not found');
  }
});

// @desc    Get all problems solved by current user
// @route   GET /api/submissions/my-solved
// @access  Private
export const getMySolvedProblems = asyncHandler(async (req, res) => {
  // Find all submissions by user
  const submissions = await Submission.find({ user: req.user._id })
    .populate({
      path: 'problem',
      select: 'title difficulty tags source'
    })
    .sort({ createdAt: -1 });

  // Filter unique problems
  const uniqueProblemsMap = new Map();
  submissions.forEach(sub => {
    if (sub.problem && !uniqueProblemsMap.has(sub.problem._id.toString())) {
      uniqueProblemsMap.set(sub.problem._id.toString(), sub.problem);
    }
  });

  const uniqueProblems = Array.from(uniqueProblemsMap.values());

  res.json(uniqueProblems);
});
