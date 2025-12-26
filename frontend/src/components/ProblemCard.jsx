import { Link } from 'react-router-dom';
import BookmarkButton from './BookmarkButton';

const RewardBookmarkButton = (props) => (
    <div className="transform transition-transform hover:scale-110">
        <BookmarkButton {...props} />
    </div>
);

const ProblemCard = ({ problem, isBookmarked, onBookmarkToggle, isRead, onReadToggle }) => {
    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Medium':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Hard':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className={`relative group h-full transition-all duration-300 ${isRead ? 'opacity-60 grayscale-[0.3]' : ''}`}>
            <Link to={`/problem/${problem._id}`} className="block h-full bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-violet-200">
                <div className="flex items-start justify-between gap-4 mb-4 pr-16">
                    <div className="flex items-center gap-3 min-w-0">
                        {isRead && (
                            <span className="flex-shrink-0 text-emerald-500" title="Completed">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </span>
                        )}
                        <h3 className="text-lg font-bold text-gray-800 truncate group-hover:text-violet-600 transition-colors">
                            {problem.title}
                        </h3>
                        <span className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getDifficultyColor(problem.difficulty)}`}>
                            {problem.difficulty}
                        </span>
                    </div>
                </div>

                <p className="text-gray-500 mb-6 text-sm leading-relaxed line-clamp-3 h-16">
                    {problem.description}
                </p>

                <div className="flex flex-col gap-4 mt-auto">
                    <div className="flex flex-wrap gap-2">
                        {problem.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-md border border-gray-100">
                                {tag}
                            </span>
                        ))}
                        {problem.tags.length > 3 && (
                            <span className="px-2 py-1 bg-gray-50 text-gray-500 text-xs font-medium rounded-md">
                                +{problem.tags.length - 3}
                            </span>
                        )}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            {problem.source}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{new Date(problem.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </Link>

            <div className="absolute top-4 right-4 z-10 flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
                <RewardBookmarkButton
                    problemId={problem._id}
                    initialState={isBookmarked}
                    onToggle={onBookmarkToggle}
                />

                {/* Mark as Read Checkbox */}
                <div className="group/cb relative flex items-center justify-center">
                    <input
                        type="checkbox"
                        checked={isRead}
                        onChange={(e) => {
                            e.stopPropagation();
                            onReadToggle();
                        }}
                        id={`read-cb-${problem._id}`}
                        className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500 cursor-pointer transition-transform hover:scale-110 active:scale-95"
                        title={isRead ? "Mark as unread" : "Mark as read"}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProblemCard;
