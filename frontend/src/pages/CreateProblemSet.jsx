import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const CreateProblemSet = () => {
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        deadline: '',
    });
    const [selectedProblems, setSelectedProblems] = useState([]);
    const [availableProblems, setAvailableProblems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditMode);
    const [teamName, setTeamName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch team
                const { data: teamData } = await api.get('/teams/my-team');
                setTeamName(teamData.name);

                // Fetch Available Problems
                const { data: problemsData } = await api.get('/problems');
                setAvailableProblems(problemsData);

                // If editing, fetch problem set data
                if (isEditMode) {
                    const { data: set } = await api.get(`/problem-sets/${id}`);
                    setFormData({
                        title: set.title,
                        description: set.description,
                        deadline: new Date(set.deadline).toISOString().slice(0, 16), // Format for datetime-local
                    });

                    // Selected problems might be objects or IDs depending on population
                    // The API returns populated problems, so we map to IDs
                    const problemIds = set.problems.map(p => typeof p === 'object' ? p._id : p);
                    setSelectedProblems(problemIds);
                }
            } catch (err) {
                console.error('Failed to load data', err);
                toast.error('Failed to load data');
            } finally {
                setFetching(false);
            }
        };
        loadData();
    }, [id, isEditMode]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const toggleProblem = (problemId) => {
        setSelectedProblems(prev =>
            prev.includes(problemId)
                ? prev.filter(id => id !== problemId)
                : [...prev, problemId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                problems: selectedProblems,
            };

            if (isEditMode) {
                await api.put(`/problem-sets/${id}`, payload);
                toast.success('Problem set updated successfully!');
            } else {
                await api.post('/problem-sets', payload);
                toast.success('Problem set created successfully!');
            }

            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <span>{isEditMode ? '✏️' : '📚'}</span> {isEditMode ? 'Edit Problem Set' : 'Create Problem Set'}
                    </h1>
                    {teamName && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-700 border border-violet-200">
                            Team: {teamName}
                        </div>
                    )}
                </div>
                {!isEditMode && <p className="text-gray-500 mb-8">Group problems for weekly challenges with a deadline</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Set Title *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="e.g., Week 1: Arrays & Hashing"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all text-sm"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description *</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            required
                            placeholder="Describe what students should focus on..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all text-sm resize-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">Deadline *</label>
                        <input
                            type="datetime-local"
                            id="deadline"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all text-sm"
                        />
                        <p className="text-xs text-gray-400">Set when this problem set should be completed</p>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                            Select Problems * <span className="text-violet-600 font-bold">({selectedProblems.length} selected)</span>
                        </label>
                        <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl bg-gray-50 p-2 custom-scrollbar">
                            {availableProblems.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-400 text-sm">No problems available. Create problems first.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {availableProblems.map(problem => (
                                        <div
                                            key={problem._id}
                                            onClick={() => toggleProblem(problem._id)}
                                            className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3 ${selectedProblems.includes(problem._id)
                                                ? 'bg-violet-50 border-violet-200 shadow-sm'
                                                : 'bg-white border-gray-100 hover:border-violet-200'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selectedProblems.includes(problem._id) ? 'bg-violet-600 border-violet-600' : 'border-gray-300 bg-white'
                                                }`}>
                                                {selectedProblems.includes(problem._id) && (
                                                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-0.5">
                                                    <strong className={`text-sm truncate pr-2 ${selectedProblems.includes(problem._id) ? 'text-violet-900' : 'text-gray-700'}`}>
                                                        {problem.title}
                                                    </strong>
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${problem.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                                                        problem.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                        {problem.difficulty}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-50 mt-8">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 px-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={loading || selectedProblems.length === 0}
                        >
                            {loading ? 'Saving...' : (isEditMode ? 'Update Set' : 'Create Problem Set')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProblemSet;
