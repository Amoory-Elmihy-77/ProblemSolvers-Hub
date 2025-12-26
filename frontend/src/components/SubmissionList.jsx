import { useAuth } from '../context/AuthContext';

const SubmissionList = ({ submissions, onMarkReference }) => {
    const { isAdmin } = useAuth();

    // Reverse submissions to show newest first
    const sortedSubmissions = [...submissions].reverse();

    if (submissions.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <p className="text-gray-400 text-lg">No submissions yet. Be the first to submit!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span>📚</span> Submissions ({submissions.length})
            </h3>

            {sortedSubmissions.map((submission) => (
                <div
                    key={submission._id}
                    className={`bg-white rounded-2xl shadow-sm border p-6 transition-all ${submission.isReferenceSolution
                            ? 'border-violet-200 ring-1 ring-violet-100 bg-violet-50/10'
                            : 'border-gray-100 hover:shadow-md'
                        }`}
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            {submission.user.avatar ? (
                                <img src={submission.user.avatar} alt={submission.user.name} className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                                    {submission.user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <h4 className="font-bold text-gray-900">{submission.user.name}</h4>
                                <small className="text-gray-400 text-xs font-medium">{new Date(submission.createdAt).toLocaleString()}</small>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            {submission.isReferenceSolution && (
                                <span className="bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full font-bold border border-amber-200 flex items-center gap-1 shadow-sm">
                                    ⭐ Reference Solution
                                </span>
                            )}
                            {isAdmin() && !submission.isReferenceSolution && (
                                <button
                                    onClick={() => onMarkReference(submission._id)}
                                    className="text-xs font-medium text-violet-600 hover:text-violet-700 hover:underline transition-colors"
                                >
                                    Mark as Reference
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h5 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Approach</h5>
                            <p className="text-gray-600 text-sm leading-relaxed">{submission.approach}</p>
                        </div>

                        <div>
                            <h5 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Thought Process</h5>
                            <p className="text-gray-600 text-sm leading-relaxed">{submission.thoughtProcess}</p>
                        </div>

                        {submission.pseudocode && (
                            <div>
                                <h5 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Pseudocode</h5>
                                <pre className="bg-gray-50 p-4 rounded-xl text-sm font-mono text-gray-700 whitespace-pre-wrap border border-gray-100">{submission.pseudocode}</pre>
                            </div>
                        )}

                        <div>
                            <h5 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Code</h5>
                            <pre className="bg-gray-900 p-4 rounded-xl text-sm font-mono text-gray-300 overflow-x-auto border border-gray-800 shadow-inner custom-scrollbar">{submission.code}</pre>
                        </div>

                        <div className="flex flex-wrap gap-4 py-4 border-t border-b border-gray-50 bg-gray-50/50 -mx-6 px-6">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-500">Time Complexity:</span>
                                <span className="text-sm font-mono font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded border border-violet-100">{submission.timeComplexity}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-500">Space Complexity:</span>
                                <span className="text-sm font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{submission.spaceComplexity}</span>
                            </div>
                        </div>

                        {submission.optimizationNotes && (
                            <div>
                                <h5 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Optimization Notes</h5>
                                <p className="text-gray-600 text-sm italic border-l-2 border-gray-200 pl-4">{submission.optimizationNotes}</p>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SubmissionList;
