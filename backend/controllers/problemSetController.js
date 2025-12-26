import asyncHandler from 'express-async-handler';
import ProblemSet from '../models/ProblemSet.js';

// @desc    Get all problem sets (scoped to team)
// @route   GET /api/problem-sets
// @access  Private
export const getProblemSets = asyncHandler(async (req, res) => {
  if (!req.user.currentTeam) {
      return res.status(200).json([]);
  }

  const problemSets = await ProblemSet.find({ team: req.user.currentTeam })
    .populate('createdBy', 'name email')
    .populate('problems', 'title difficulty')
    .sort({ deadline: -1 });

  res.json(problemSets);
});

// @desc    Get single problem set
// @route   GET /api/problem-sets/:id
// @access  Private
export const getProblemSetById = asyncHandler(async (req, res) => {
  const problemSet = await ProblemSet.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('problems');

  if (problemSet) {
    if (problemSet.team.toString() !== req.user.currentTeam.toString()) {
        res.status(403);
        throw new Error('Not authorized to view this set');
    }
    res.json(problemSet);
  } else {
    res.status(404);
    throw new Error('Problem set not found');
  }
});

// @desc    Create new problem set
// @route   POST /api/problem-sets
// @access  Private
export const createProblemSet = asyncHandler(async (req, res) => {
  const { title, description, problems, deadline } = req.body;

  if (!req.user.currentTeam) {
      res.status(400);
      throw new Error('You must join a team to create problem sets');
  }

  const problemSet = await ProblemSet.create({
    title,
    description,
    problems,
    deadline,
    createdBy: req.user._id,
    team: req.user.currentTeam
  });

  const populatedSet = await ProblemSet.findById(problemSet._id)
    .populate('createdBy', 'name email')
    .populate('problems', 'title difficulty');

  res.status(201).json(populatedSet);
});

// @desc    Update problem set
// @route   PUT /api/problem-sets/:id
// @access  Private/Admin
export const updateProblemSet = asyncHandler(async (req, res) => {
  const { title, description, problems, deadline } = req.body;

  const problemSet = await ProblemSet.findById(req.params.id);

  if (problemSet) {
    if (problemSet.team.toString() !== req.user.currentTeam.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this set');
    }

    problemSet.title = title || problemSet.title;
    problemSet.description = description || problemSet.description;
    problemSet.problems = problems || problemSet.problems;
    problemSet.deadline = deadline || problemSet.deadline;

    const updatedSet = await problemSet.save();
    const populatedSet = await ProblemSet.findById(updatedSet._id)
      .populate('createdBy', 'name email')
      .populate('problems', 'title difficulty');

    res.json(populatedSet);
  } else {
    res.status(404);
    throw new Error('Problem set not found');
  }
});

// @desc    Delete problem set
// @route   DELETE /api/problem-sets/:id
// @access  Private/Admin
export const deleteProblemSet = asyncHandler(async (req, res) => {
  const problemSet = await ProblemSet.findById(req.params.id);

  if (problemSet) {
    if (problemSet.team.toString() !== req.user.currentTeam.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete this set');
    }

    await problemSet.deleteOne();
    res.json({ message: 'Problem set removed' });
  } else {
    res.status(404);
    throw new Error('Problem set not found');
  }
});
