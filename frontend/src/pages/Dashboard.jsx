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
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                                <h2 className="text-lg font-bold text-gray-800 px-2">
                                    Challenges <span className="text-gray-400 font-normal text-sm ml-1">({filteredSets.length})</span>
                                </h2>
                                <div className="relative w-full md:max-w-xs">
                                    <input
                                        type="text"
                                        placeholder="Search challenges..."
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all"
                                    />
                                    <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                                <h2 className="text-lg font-bold text-gray-800 px-2">
                                    Problems <span className="text-gray-400 font-normal text-sm ml-1">({filteredProblems.length})</span>
                                </h2>

                                <div className="flex flex-col lg:flex-row items-center gap-3 w-full md:w-auto">
                                    {/* Search Input */}
                                    <div className="relative w-full sm:max-w-xs">
                                        <input
                                            type="text"
                                            placeholder="Search problems..."
                                            value={filters.search}
                                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all"
                                        />
                                        <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                                        {/* Bookmark Toggle */}
                                        <label className="relative inline-flex items-center cursor-pointer mr-2">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={showBookmarksOnly}
                                                onChange={() => setShowBookmarksOnly(!showBookmarksOnly)}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                                            <span className="ml-3 text-sm font-medium text-gray-700">Show Bookmarks</span>
                                        </label>

                                        <select
                                            value={filters.difficulty}
                                            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                                            className="w-full sm:w-auto px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
                                        >
                                            <option value="All">Difficulty: All</option>
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>

                                        <select
                                            value={filters.source}
                                            onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                                            className="w-full sm:w-auto px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-shadow"
                                        >
                                            <option value="All">Source: All</option>
                                            <option value="LeetCode">LeetCode</option>
                                            <option value="Codeforces">Codeforces</option>
                                            <option value="Custom">Custom</option>
                                        </select>
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
