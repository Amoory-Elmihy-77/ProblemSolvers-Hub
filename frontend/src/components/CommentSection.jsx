import { useState } from 'react';
import api from '../api/axios';

const CommentSection = ({ comments, problemId, onCommentAdded }) => {
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setError('');
        setLoading(true);

        try {
            await api.post('/comments', {
                problem: problemId,
                content: newComment,
            });
            setNewComment('');
            if (onCommentAdded) {
                onCommentAdded();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post comment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit sticky top-6">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span>💬</span> Discussion ({comments.length})
            </h3>

            <form onSubmit={handleSubmit} className="mb-8">
                {error && <div className="text-red-600 text-sm mb-2 font-medium">{error}</div>}
                <div className="relative">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add your thoughts, ask questions..."
                        rows="3"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all text-sm resize-none mb-3"
                    />
                    <button
                        type="submit"
                        disabled={loading || !newComment.trim()}
                        className="w-full py-2 bg-violet-600 text-white rounded-lg font-bold hover:bg-violet-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {loading ? 'Posting...' : 'Post Comment'}
                    </button>
                </div>
            </form>

            <div className="space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                {comments.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-400 text-sm">No comments yet. Start the discussion!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment._id} className="flex gap-3 group">
                            <div className="shrink-0">
                                {comment.user.avatar ? (
                                    <img src={comment.user.avatar} alt={comment.user.name} className="w-8 h-8 rounded-full object-cover border border-gray-100" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                        {comment.user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="bg-gray-50 rounded-2xl rounded-tl-none p-3 border border-gray-100 group-hover:bg-white group-hover:border-violet-100 group-hover:shadow-sm transition-all">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <strong className="text-sm text-gray-900">{comment.user.name}</strong>
                                        <small className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</small>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CommentSection;
