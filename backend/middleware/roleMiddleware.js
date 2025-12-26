import asyncHandler from 'express-async-handler';

// Admin only middleware
export const adminOnly = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Not authorized as admin');
  }
});
