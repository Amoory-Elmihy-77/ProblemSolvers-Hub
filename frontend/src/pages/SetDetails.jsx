import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const SetDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [set, setSet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSet = async () => {
            try {
                const { data } = await api.get(`/problem-sets/${id}`);
                setSet(data);
            } catch (err) {
                setError('Failed to load problem set details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSet();
    }, [id]);

    const getDaysRemaining = (deadline) => {
        const now = new Date();
        const due = new Date(deadline);
        const diffTime = due - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: 'Expired', color: 'text-red-600 bg-red-50 border-red-200' };
        if (diffDays === 0) return { text: 'Due Today', color: 'text-amber-600 bg-amber-50 border-amber-200' };
        return { text: `${diffDays} Days Left`, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
        </div>
    );

    if (error || !set) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
            <p className="text-gray-500 mb-6">{error || 'Problem set not found'}</p>
            <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
            >
                Back to Dashboard
            </button>
        </div>
    );

    const deadlineStatus = getDaysRemaining(set.deadline);

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this problem set?')) {
            try {
                await api.delete(`/problem-sets/${id}`);
                navigate('/dashboard');
            } catch (err) {
                console.error('Failed to delete', err);
                alert('Failed to delete problem set');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header Section */}
            <div className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center text-sm text-gray-500 hover:text-violet-600 transition-colors"
                        >
                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Dashboard
                        </button>

                        <div className="flex gap-2">
                            <Link
                                to={`/set/edit/${id}`}
                                className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-violet-600 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="px-3 py-2 text-sm font-medium text-red-600 bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <h1 className="text-3xl font-bold text-gray-900">{set.title}</h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${deadlineStatus.color}`}>
                                    {deadlineStatus.text}
                                </span>
                            </div>
                            <p className="text-gray-600 max-w-2xl leading-relaxed">{set.description}</p>
                        </div>

                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="text-center px-2">
                                <div className="text-2xl font-bold text-violet-600">{set.problems.length}</div>
                                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Problems</div>
                            </div>
                            <div className="w-px h-8 bg-gray-200"></div>
                            <div className="text-center px-2">
                                <div className="text-sm font-bold text-gray-900">
                                    {new Date(set.deadline).toLocaleDateString()}
                                </div>
                                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">Due Date</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Problems List */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span>🧩</span> Problems in this Configuration
                </h2>

                <div className="grid gap-4">
                    {set.problems.map((problem, index) => (
                        <Link
                            key={problem._id}
                            to={`/problem/${problem._id}`}
                            className="group block bg-white rounded-xl border border-gray-200 p-4 hover:border-violet-300 hover:shadow-md transition-all"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg text-gray-500 font-bold text-sm group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 group-hover:text-violet-600 transition-colors">
                                            {problem.title}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${problem.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                problem.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                    'bg-red-50 text-red-700 border-red-100'
                                                }`}>
                                                {problem.difficulty}
                                            </span>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs text-gray-500">{problem.tags.join(', ')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center text-gray-400 group-hover:text-violet-600 transition-colors">
                                    <span className="text-sm font-medium mr-2">Solve</span>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SetDetails;
