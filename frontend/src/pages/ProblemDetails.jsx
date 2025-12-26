import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import SubmissionForm from '../components/SubmissionForm';
import SubmissionList from '../components/SubmissionList';
import CommentSection from '../components/CommentSection';
import toast from 'react-hot-toast';

const ProblemDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [problem, setProblem] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProblemData();
    }, [id]);

    const fetchProblemData = async () => {
        try {
            const [problemRes, submissionsRes, commentsRes] = await Promise.all([
                api.get(`/problems/${id}`),
                api.get(`/submissions/problem/${id}`),
                api.get(`/comments/problem/${id}`),
            ]);

            setProblem(problemRes.data);
            setSubmissions(submissionsRes.data);
            setComments(commentsRes.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch problem details');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this problem?')) {
            try {
                await api.delete(`/problems/${id}`);
                toast.success('Problem deleted successfully');
                navigate('/dashboard');
            } catch (err) {
                console.error('Failed to delete', err);
                toast.error('Failed to delete problem');
            }
        }
    };

    const handleSubmissionCreated = () => {
        fetchProblemData(); // Refresh all data
    };

    const handleCommentAdded = () => {
        fetchProblemData(); // Refresh all data
    };

    const handleMarkReference = async (submissionId) => {
        try {
            await api.put(`/submissions/${submissionId}/reference`);
            fetchProblemData(); // Refresh to show updated reference
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to mark as reference');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Loading problem...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md mx-4">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Problem</h2>
                    <p className="text-gray-600">{error}</p>
                    <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!problem) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-500">
                    <h2 className="text-2xl font-bold mb-2">Problem Not Found</h2>
                    <p>The problem you're looking for doesn't exist or has been removed.</p>
                </div>
            </div>
        );
    }

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Easy': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Hard': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Problem Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                            <div className="flex-1">
                                <h1 className="text-3xl font-extrabold text-gray-900 leading-tight mb-2">
                                    {problem.title}
                                </h1>
                                <div className="flex flex-wrap gap-2 shrink-0">
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getDifficultyColor(problem.difficulty)}`}>
                                        {problem.difficulty}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-600 border border-gray-200">
                                        {problem.source}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Link
                                    to={`/problem/edit/${id}`}
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

                        <div className="prose prose-violet max-w-none text-gray-600 mb-8 leading-relaxed">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                            <p className="whitespace-pre-wrap">{problem.description}</p>
                        </div>

                        {problem.url && (
                            <a
                                href={problem.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-4 bg-violet-50 rounded-xl text-violet-700 hover:bg-violet-100 transition-colors group border border-violet-100 mb-6"
                            >
                                <span className="text-xl">🔗</span>
                                <span className="font-medium group-hover:underline">{problem.url}</span>
                                <span className="text-violet-400 group-hover:translate-x-1 transition-transform">↗</span>
                            </a>
                        )}

                        <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-gray-50">
                            {problem.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {problem.tags.map((tag, index) => (
                                        <span key={index} className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg border border-gray-200">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-400 ml-auto font-medium">
                                <span>Created by {problem.createdBy?.name}</span>
                                <span>•</span>
                                <span>{new Date(problem.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Submission Form & List */}
                    <div className="lg:col-span-2 space-y-8">
                        <SubmissionForm
                            problemId={id}
                            onSubmissionCreated={handleSubmissionCreated}
                        />
                        <SubmissionList
                            submissions={submissions}
                            onMarkReference={handleMarkReference}
                        />
                    </div>

                    {/* Right Column: Comments */}
                    <div className="lg:col-span-1">
                        <CommentSection
                            comments={comments}
                            problemId={id}
                            onCommentAdded={handleCommentAdded}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemDetails;
