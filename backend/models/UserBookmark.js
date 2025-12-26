import mongoose from 'mongoose';

const userBookmarkSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only bookmark a problem once
userBookmarkSchema.index({ user: 1, problem: 1 }, { unique: true });

const UserBookmark = mongoose.model('UserBookmark', userBookmarkSchema);

export default UserBookmark;
