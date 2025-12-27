import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AddProblem = () => {
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'Medium',
        tags: '',
        source: 'Custom',
        url: '',
    });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditMode);
    const [teamName, setTeamName] = useState('');
    const [problemSets, setProblemSets] = useState([]);
    const [selectedSetId, setSelectedSetId] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDisplayData = async () => {
            try {
                // Fetch Team Name
                const { data: teamData } = await api.get('/teams/my-team');
                setTeamName(teamData.name);

                // Fetch Problem if Editing
                if (isEditMode) {
                    const { data: problem } = await api.get(`/problems/${id}`);
                    setFormData({
                        title: problem.title,
                        description: problem.description,
                        difficulty: problem.difficulty,
                        tags: problem.tags.join(', '),
                        source: problem.source,
                        url: problem.url || '',
                    });
                }

                // Fetch Problem Sets for the team
                const { data: setsData } = await api.get('/problem-sets');
                setProblemSets(setsData);
            } catch (err) {
                console.error("Failed to load data", err);
                toast.error("Failed to load data");
            } finally {
                setFetching(false);
            }
        };
        fetchDisplayData();
    }, [id, isEditMode]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Convert tags string to array
            const tagsArray = formData.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter((tag) => tag !== '');

            const payload = {
                ...formData,
                tags: tagsArray,
            };

            if (isEditMode) {
                await api.put(`/problems/${id}`, payload);
                toast.success('Problem updated successfully!');
            } else {
                const { data: newProblem } = await api.post('/problems', payload);

                // If a problem set was selected, add the problem to it
                if (selectedSetId) {
                    await api.patch(`/problem-sets/${selectedSetId}/add-problem`, {
                        problemId: newProblem._id
                    });
                }

                toast.success('Problem created successfully!');
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <span>{isEditMode ? '✏️' : '✨'}</span> {isEditMode ? 'Edit Problem' : 'Create New Problem'}
                    </h1>
                    {teamName && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-violet-100 text-violet-700 border border-violet-200">
                            Team: {teamName}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all text-sm"
                            placeholder="e.g. Two Sum"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description *</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="6"
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all text-sm resize-y"
                            placeholder="Describe the problem statement, input/output format, and constraints..."
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700">Difficulty *</label>
                            <div className="relative">
                                <select
                                    id="difficulty"
                                    name="difficulty"
                                    value={formData.difficulty}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all text-sm appearance-none cursor-pointer"
                                >
                                    <option value="Easy">Easy</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Hard">Hard</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="source" className="block text-sm font-medium text-gray-700">Source *</label>
                            <div className="relative">
                                <select
                                    id="source"
                                    name="source"
                                    value={formData.source}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all text-sm appearance-none cursor-pointer"
                                >
                                    <option value="LeetCode">LeetCode</option>
                                    <option value="Codeforces">Codeforces</option>
                                    <option value="Custom">Custom</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                            Problem URL <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <input
                            type="url"
                            id="url"
                            name="url"
                            value={formData.url}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all text-sm"
                            placeholder="https://leetcode.com/problems/two-sum/"
                        />
                        <p className="text-xs text-gray-400">Link to the original problem if applicable</p>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags</label>
                        <input
                            type="text"
                            id="tags"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all text-sm"
                            placeholder="e.g. Array, DP, Sliding Window"
                        />
                        <p className="text-xs text-gray-400">Separate tags with commas</p>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="problemSet" className="block text-sm font-medium text-gray-700">
                            Add to Problem Set <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <div className="relative">
                            <select
                                id="problemSet"
                                name="problemSet"
                                value={selectedSetId}
                                onChange={(e) => setSelectedSetId(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all text-sm appearance-none cursor-pointer"
                            >
                                <option value="">-- None --</option>
                                {problemSets.map(set => (
                                    <option key={set._id} value={set._id}>{set.title}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400">Automatically add this problem to a set</p>
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
                            disabled={loading}
                            className="flex-1 py-3 px-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Saving...' : (isEditMode ? 'Update Problem' : 'Create Problem')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProblem;
