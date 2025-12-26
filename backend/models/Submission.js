import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    problem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approach: {
      type: String,
      required: [true, 'Please describe your approach'],
    },
    thoughtProcess: {
      type: String,
      required: [true, 'Please describe your thought process'],
    },
    pseudocode: {
      type: String,
    },
    code: {
      type: String,
      required: [true, 'Please provide the code'],
    },
    timeComplexity: {
      type: String,
      required: [true, 'Please provide time complexity'],
    },
    spaceComplexity: {
      type: String,
      required: [true, 'Please provide space complexity'],
    },
    optimizationNotes: {
      type: String,
    },
    isReferenceSolution: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one submission can be marked as reference per problem
submissionSchema.index({ problem: 1, isReferenceSolution: 1 });

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;
