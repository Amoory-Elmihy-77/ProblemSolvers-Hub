import mongoose from 'mongoose';

const problemStatusSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
    },
    isRead: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user has only one status record per problem
problemStatusSchema.index({ user: 1, problem: 1 }, { unique: true });

const ProblemStatus = mongoose.model('ProblemStatus', problemStatusSchema);

export default ProblemStatus;
