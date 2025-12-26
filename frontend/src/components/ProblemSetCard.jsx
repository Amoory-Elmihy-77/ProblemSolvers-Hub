import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const ProblemSetCard = ({ problemSet }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const deadline = new Date(problemSet.deadline);
            const now = new Date();
            const diff = deadline - now;

            if (diff <= 0) {
                setIsExpired(true);
                setTimeLeft('Expired');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h left`);
            } else if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m left`);
            } else {
                setTimeLeft(`${minutes}m left`);
            }
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [problemSet.deadline]);

    return (
        <div className={`h-full bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:border-violet-100 transition-all duration-300 flex flex-col ${isExpired ? 'opacity-75 grayscale-[0.3]' : ''}`}>
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800 line-clamp-1 flex-1 pr-4">{problemSet.title}</h3>
                <div className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${isExpired ? 'bg-red-100 text-red-600' : 'bg-violet-100 text-violet-600'
                    }`}>
                    {isExpired ? '⏰ Expired' : `⏳ ${timeLeft}`}
                </div>
            </div>

            <p className="text-gray-500 text-sm mb-6 line-clamp-2 h-10">{problemSet.description}</p>

            <div className="flex items-center gap-4 mb-6 text-sm text-gray-500 bg-gray-50 p-3 rounded-xl">
                <div className="flex items-center gap-1.5 font-medium">
                    <span>📝</span>
                    <span>{problemSet.problems.length} Problems</span>
                </div>
                <div className="h-4 w-px bg-gray-300"></div>
                <div className="flex items-center gap-1.5">
                    <span>🗓️</span>
                    <span>{new Date(problemSet.deadline).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="space-y-2 mt-auto">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Top Problems</h4>
                {problemSet.problems.slice(0, 3).map((problem, index) => (
                    <Link
                        key={problem._id}
                        to={`/problem/${problem._id}`}
                        className="flex justify-between items-center p-2 rounded-lg hover:bg-violet-50 text-sm text-gray-700 hover:text-violet-700 transition-colors group"
                    >
                        <span className="line-clamp-1 flex-1">
                            <span className="text-gray-400 mr-2 group-hover:text-violet-400">{index + 1}.</span>
                            {problem.title}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ml-2 ${problem.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                                problem.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                    'bg-red-100 text-red-700'
                            }`}>
                            {problem.difficulty}
                        </span>
                    </Link>
                ))}
                {problemSet.problems.length > 3 && (
                    <div className="text-center text-xs font-medium text-gray-400 mt-2">
                        +{problemSet.problems.length - 3} more
                    </div>
                )}
            </div>

            <Link to={`/set/${problemSet._id}`} className="mt-6 block w-full text-center py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-violet-600 transition-colors shadow-sm">
                View Challenge
            </Link>
        </div>
    );
};

export default ProblemSetCard;
