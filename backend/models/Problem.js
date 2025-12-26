import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: [true, 'Please specify difficulty'],
    },
    tags: {
      type: [String],
      default: [],
    },
    source: {
      type: String,
      enum: ['LeetCode', 'Codeforces', 'Custom'],
      default: 'Custom',
    },
    url: {
      type: String,
      trim: true,
    },
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;
