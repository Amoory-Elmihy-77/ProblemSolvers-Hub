import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const EditTeam = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                // We can't easily fetch distinct team by ID if not searching, 
                // but /teams/my-team should give us the current team, enabling check.
                // Or try searching? 
                // However, the cleanest way is `getMyTeam` and verifying ID matches.

                const { data } = await api.get('/teams/my-team');
                if (data._id !== id) {
                    toast.error("You can only edit your current team");
                    navigate('/dashboard');
                    return;
                }

                // Verify leader role
                const myMember = data.members.find(m => m.user._id === JSON.parse(localStorage.getItem('user'))._id); // Simple check, real check is server side
                // But better to trust server response or what we have.
                // Let's just populate. Server will reject if not allowed.

                setFormData({
                    name: data.name,
                    description: data.description || '',
                });
            } catch (err) {
                console.error(err);
                toast.error("Failed to load team details");
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchTeam();
    }, [id, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/teams/${id}`, formData);
            toast.success('Team updated successfully');
            navigate('/profile');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update team');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Edit Team</h1>
                    <p className="text-gray-500 text-sm mt-2">Update your team's profile</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-sm resize-none"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/profile')}
                            className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-3 px-4 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-colors shadow-lg disabled:opacity-70"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTeam;
