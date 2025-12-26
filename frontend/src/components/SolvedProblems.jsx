import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const SolvedProblems = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSolvedProblems = async () => {
            try {
                const { data } = await api.get('/submissions/my-solved');
                setProblems(data);
            } catch (error) {
                console.error('Failed to fetch solved problems', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSolvedProblems();
    }, []);

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy':
                return 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30';
            case 'Medium':
                return 'bg-amber-400/20 text-amber-300 border-amber-400/30';
            case 'Hard':
                return 'bg-red-400/20 text-red-300 border-red-400/30';
            default:
                return 'bg-gray-400/20 text-gray-300 border-gray-400/30';
        }
    };

    if (loading) return (
        <div className="w-full flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        </div>
    );

    if (problems.length === 0) return null;

    return (
        <div className="w-full max-w-6xl mx-auto mt-12 mb-12">
            <div className="relative overflow-hidden rounded-3xl p-1 bg-gradient-to-br from-white/40 to-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">

                {/* Glass Header */}
                <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between relative z-10">
                    <div>
                        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-indigo-200 drop-shadow-sm">
                            Solved Problems
                        </h2>
                        <p className="text-blue-100/70 text-sm font-medium mt-1">
                            Your journey of conquests <span className="mx-1">•</span> {problems.length} Solved
                        </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-teal-400 to-indigo-500 blur-sm absolute right-10 opacity-50"></div>
                </div>

                {/* Content Grid */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-black/5">
                    {problems.map((problem) => (
                        <Link
                            to={`/problem/${problem._id}`}
                            key={problem._id}
                            className="group relative flex flex-col h-full overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
                        >
                            {/* Card Background / Glass Effect */}
                            <div className="absolute inset-0 bg-white/10 backdrop-blur-md border border-white/10 group-hover:bg-white/15 transition-colors"></div>

                            {/* Glowing Gradient Blob on Hover */}
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="relative p-5 flex flex-col h-full z-10">
                                <div className="flex justify-between items-start gap-2 mb-3">
                                    <h3 className="font-bold text-white text-lg leading-tight group-hover:text-indigo-200 transition-colors line-clamp-1">
                                        {problem.title}
                                    </h3>
                                    <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm ${getDifficultyColor(problem.difficulty)}`}>
                                        {problem.difficulty}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-2 mt-auto">
                                    {problem.tags.slice(0, 3).map((tag, i) => (
                                        <span key={i} className="text-[10px] px-2 py-1 rounded bg-white/5 text-gray-300 border border-white/5">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
                                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                        {problem.source}
                                    </span>
                                    <svg className="w-4 h-4 text-gray-400 group-hover:text-indigo-300 transition-colors transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Background Decoration implementation using absolute positioning outside the main container if needed, 
                but keeping it self-contained for now. 
            */}
        </div>
    );
};

export default SolvedProblems;
