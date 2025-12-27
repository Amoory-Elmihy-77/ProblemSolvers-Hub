import asyncHandler from 'express-async-handler';
import Problem from '../models/Problem.js';

// @desc    Get all problems (scoped to user's team)
// @route   GET /api/problems
// @access  Private
export const getProblems = asyncHandler(async (req, res) => {
  // Check if user is in a team
  if (!req.user.currentTeam) {
    return res.status(200).json([]); // Return empty if no team
  }

  const keyword = req.query.keyword
    ? {
        $or: [
          { title: { $regex: req.query.keyword, $options: 'i' } },
          { description: { $regex: req.query.keyword, $options: 'i' } },
        ],
      }
    : {};

  const problems = await Problem.find({ team: req.user.currentTeam, ...keyword })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.json(problems);
});

// @desc    Get single problem
// @route   GET /api/problems/:id
// @access  Private
export const getProblemById = asyncHandler(async (req, res) => {
  const problem = await Problem.findById(req.params.id).populate(
    'createdBy',
    'name email'
  );

  if (problem) {
    // Check team access
    if (problem.team.toString() !== req.user.currentTeam.toString()) {
        res.status(403);
        throw new Error('Not authorized to view this problem');
    }
    res.json(problem);
  } else {
    res.status(404);
    throw new Error('Problem not found');
  }
});

// @desc    Create new problem
// @route   POST /api/problems
// @access  Private
export const createProblem = asyncHandler(async (req, res) => {
  const { title, description, difficulty, tags, source, url } = req.body;

  if (!req.user.currentTeam) {
    res.status(400);
    throw new Error('You must join a team to add problems');
  }

  const problem = await Problem.create({
    title,
    description,
    difficulty,
    tags,
    source,
    url,
    createdBy: req.user._id,
    team: req.user.currentTeam
  });

  res.status(201).json(problem);
});

// @desc    Update problem
// @route   PUT /api/problems/:id
// @access  Private/Admin
export const updateProblem = asyncHandler(async (req, res) => {
  const { title, description, difficulty, tags, source, url } = req.body;

  const problem = await Problem.findById(req.params.id);

  if (problem) {
    // Check team ownership
    if (problem.team.toString() !== req.user.currentTeam.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this problem');
    }

    problem.title = title || problem.title;
    problem.description = description || problem.description;
    problem.difficulty = difficulty || problem.difficulty;
    problem.tags = tags || problem.tags;
    problem.source = source || problem.source;
    problem.url = url || problem.url;

    const updatedProblem = await problem.save();
    res.json(updatedProblem);
  } else {
    res.status(404);
    throw new Error('Problem not found');
  }
});

// @desc    Delete problem
// @route   DELETE /api/problems/:id
// @access  Private/Admin
export const deleteProblem = asyncHandler(async (req, res) => {
  const problem = await Problem.findById(req.params.id);

  if (problem) {
    // Check team ownership
    if (problem.team.toString() !== req.user.currentTeam.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete this problem');
    }

    await problem.deleteOne();
    res.json({ message: 'Problem removed' });
  } else {
    res.status(404);
    throw new Error('Problem not found');
  }
});
