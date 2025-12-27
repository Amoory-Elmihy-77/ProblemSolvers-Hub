import { useState, useEffect } from 'react';
import api from '../api/axios';
import ProblemCard from '../components/ProblemCard';
import ProblemSetCard from '../components/ProblemSetCard';

const Dashboard = () => {
    const [problems, setProblems] = useState([]);
    const [problemSets, setProblemSets] = useState([]);
    const [bookmarks, setBookmarks] = useState([]);
    const [readStatuses, setReadStatuses] = useState([]);
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
    const [activeTab, setActiveTab] = useState('challenges');
    const [filters, setFilters] = useState({
        difficulty: 'All',
        source: 'All',
        search: '',
    });

    useEffect(() => {
        fetchData();
        fetchTeamDetails();
    }, []);

    // Helper for difficulty colors
    const getDiffColor = (diff) => {
        switch (diff) {
            case 'Easy': return 'text-emerald-500';
            case 'Medium': return 'text-amber-500';
            case 'Hard': return 'text-rose-500';
            default: return 'text-gray-500';
        }
    };

    const fetchTeamDetails = async () => {
        try {
            const { data } = await api.get('/teams/my-team');
            setTeam(data);
        } catch (err) {
            console.error("Failed to fetch team", err);
            // If 404, maybe redirect to team selection? For now just log.
        }
    };

    const fetchData = async () => {
        try {
            const [problemsRes, setsRes, bookmarksRes, statusRes] = await Promise.all([
                api.get('/problems'),
                api.get('/problem-sets'),
                api.get('/bookmarks'),
                api.get('/status/my-read'),
            ]);
            setProblems(problemsRes.data);
            setProblemSets(setsRes.data);
            setBookmarks(bookmarksRes.data.filter(b => b.problem).map(b => b.problem._id));
            setReadStatuses(statusRes.data);
        } catch (err) {
            console.error('Failed to fetch data', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const handleReadToggle = async (problemId) => {
        try {
            const { data } = await api.post('/status/toggle-read', { problemId });
            if (data.isRead) {
                setReadStatuses([...readStatuses, problemId]);
            } else {
                setReadStatuses(readStatuses.filter(id => id !== problemId));
            }
        } catch (err) {
            console.error('Failed to toggle read status', err);
        }
    };

    const filteredSets = problemSets.filter((set) => {
        if (filters.search === '') return true;
        const searchLower = filters.search.toLowerCase();
        return (
            set.title.toLowerCase().includes(searchLower) ||
            set.description.toLowerCase().includes(searchLower)
        );
    });

    const filteredProblems = problems.filter((problem) => {
        if (showBookmarksOnly && !bookmarks.includes(problem._id)) {
            return false;
        }
        if (filters.difficulty !== 'All' && problem.difficulty !== filters.difficulty) {
            return false;
        }
        if (filters.source !== 'All' && problem.source !== filters.source) {
            return false;
        }
        if (filters.search !== '') {
            const searchLower = filters.search.toLowerCase();
            return (
                problem.title.toLowerCase().includes(searchLower) ||
                problem.description.toLowerCase().includes(searchLower)
            );
        }
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-lg font-medium text-gray-500 bg-gray-50">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
                    <div>Loading dashboard...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-12 bg-gray-50">
            {/* Header with Gradient & Glassmorphism */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-16 px-4 sm:px-6 lg:px-8 text-center shadow-lg relative overflow-hidden">
                <div className="relative z-10 max-w-4xl mx-auto">
                    {team && (
                        <div className="inline-block bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-semibold mb-6 border border-white/30 shadow-sm transition-transform hover:scale-105 cursor-default">
                            Team: {team.name} 🚀
                        </div>
                    )}
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 drop-shadow-sm">
                        Problem Dashboard
                    </h1>
                    <p className="text-lg text-indigo-100 max-w-2xl mx-auto font-light">
                        Welcome to your learning journey. Track your progress, solve challenges, and grow with your team.
                    </p>
                </div>

                {/* Decorative background blobs */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
                {/* Tab Navigation (Glassmorphic Pill) */}
                <div className="flex justify-center space-x-1 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-white/50 shadow-xl mx-auto max-w-fit mb-12">
                    <button
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${activeTab === 'challenges'
                            ? 'bg-violet-600 text-white shadow-md transform scale-105'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-violet-600'
                            }`}
                        onClick={() => setActiveTab('challenges')}
                    >
                        📅 Weekly Challenges
                        {problemSets.length > 0 && (
                            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'challenges' ? 'bg-white/20 text-white' : 'bg-violet-100 text-violet-600'}`}>
                                {problemSets.length}
                            </span>
                        )}
                    </button>
                    <button
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2 ${activeTab === 'problems'
                            ? 'bg-violet-600 text-white shadow-md transform scale-105'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-violet-600'
                            }`}
                        onClick={() => setActiveTab('problems')}
                    >
                        🧩 All Problems
                    </button>
                </div>

                {/* Content Area */}
                <div className="animate-fade-in-up">
                    {activeTab === 'challenges' && (
                        <div className="space-y-6">
                            {/* Search Bar for Challenges */}
                            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-indigo-100/50 border border-white/60 flex flex-col md:flex-row justify-between items-center gap-6 mb-4 transition-all hover:shadow-2xl hover:shadow-indigo-100/70">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="bg-indigo-100 p-2.5 rounded-2xl">
                                        <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 tracking-tight text-center md:text-left">
                                            Challenges <span className="text-indigo-400 font-medium text-sm ml-1">({filteredSets.length})</span>
                                        </h2>
                                        <p className="text-sm text-gray-500 font-medium">Curated weekly problem sets</p>
                                    </div>
                                </div>
                                <div className="relative w-full md:max-w-xs group">
                                    <input
                                        type="text"
                                        placeholder="Search challenges..."
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200/80 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white transition-all duration-300 placeholder:text-gray-400 font-medium"
                                    />
                                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            {filteredSets.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredSets.map(set => (
                                        <ProblemSetCard key={set._id} problemSet={set} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                                    <div className="text-6xl mb-4 opacity-80">📅</div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Challenges</h3>
                                    <p className="text-gray-500">Check back later for new weekly problem sets!</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'problems' && (
                        <div className="space-y-6">
                            {/* Filter Bar */}
                            {/* Enhanced Filter Bar */}
                            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl shadow-indigo-100/50 border border-white/60 flex flex-col xl:flex-row justify-between items-center gap-6 mb-8 transition-all hover:shadow-2xl hover:shadow-indigo-100/70">
                                <div className="flex items-center gap-4 w-full xl:w-auto">
                                    <div className="bg-violet-100 p-2.5 rounded-2xl">
                                        <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-gray-900 tracking-tight">
                                            Problems Library
                                        </h2>
                                        <p className="text-sm text-gray-500 font-medium">
                                            {filteredProblems.length} challenges available
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
                                    {/* Glass Search Input */}
                                    <div className="relative w-full md:w-80 group">
                                        <input
                                            type="text"
                                            placeholder="Search problems..."
                                            value={filters.search}
                                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200/80 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 focus:bg-white transition-all duration-300 placeholder:text-gray-400 font-medium"
                                        />
                                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-violet-500 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full">
                                        {/* Bookmark Toggle Card */}
                                        <button
                                            onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
                                            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border transition-all duration-300 font-semibold text-sm ${showBookmarksOnly
                                                ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm'
                                                : 'bg-white border-gray-100 text-gray-600 hover:border-violet-200 hover:bg-violet-50/30'
                                                }`}
                                        >
                                            <span className={`text-lg ${showBookmarksOnly ? 'text-amber-500 animate-pulse' : 'text-gray-400'}`}>
                                                {showBookmarksOnly ? '⭐' : '☆'}
                                            </span>
                                            Bookmarks
                                        </button>

                                        <div className="h-8 w-px bg-gray-200 hidden md:block mx-1"></div>

                                        {/* Styled Selects */}
                                        <div className="relative group">
                                            <select
                                                value={filters.difficulty}
                                                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                                                className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all cursor-pointer min-w-[140px]"
                                            >
                                                <option value="All">All Levels</option>
                                                <option value="Easy">🟢 Easy</option>
                                                <option value="Medium">🟠 Medium</option>
                                                <option value="Hard">🔴 Hard</option>
                                            </select>
                                            <svg className="absolute right-3.5 top-3.5 w-4 h-4 text-gray-400 pointer-events-none group-focus-within:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>

                                        <div className="relative group">
                                            <select
                                                value={filters.source}
                                                onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                                                className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all cursor-pointer min-w-[140px]"
                                            >
                                                <option value="All">All Sources</option>
                                                <option value="LeetCode">LeetCode</option>
                                                <option value="Codeforces">Codeforces</option>
                                                <option value="Custom">Custom</option>
                                            </select>
                                            <svg className="absolute right-3.5 top-3.5 w-4 h-4 text-gray-400 pointer-events-none group-focus-within:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                                    <p className="text-red-700">{error}</p>
                                </div>
                            )}

                            {filteredProblems.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                                    <div className="text-6xl mb-4">
                                        {showBookmarksOnly ? '⭐' : '📝'}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {showBookmarksOnly ? "No bookmarked problems yet" : "No problems found"}
                                    </h3>
                                    <p className="text-gray-500 max-w-md mx-auto">
                                        {showBookmarksOnly
                                            ? "Mark problems as important to save them here for quick access."
                                            : "Get started by creating your first problem or adjusting filters!"}
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredProblems.map((problem) => (
                                        <ProblemCard
                                            key={problem._id}
                                            problem={problem}
                                            isBookmarked={bookmarks.includes(problem._id)}
                                            onBookmarkToggle={(isAdded) => {
                                                if (isAdded) {
                                                    setBookmarks([...bookmarks, problem._id]);
                                                } else {
                                                    setBookmarks(bookmarks.filter(id => id !== problem._id));
                                                }
                                            }}
                                            isRead={readStatuses.includes(problem._id)}
                                            onReadToggle={() => handleReadToggle(problem._id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
