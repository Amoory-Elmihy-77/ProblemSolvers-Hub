import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import SolvedProblems from '../components/SolvedProblems';

const Profile = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar ? `http://localhost:3000${user.avatar}` : null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Team Management State
    const [teamData, setTeamData] = useState(null);
    const [isLeader, setIsLeader] = useState(false);

    useEffect(() => {
        fetchTeamData();
    }, [user]);

    const fetchTeamData = async () => {
        if (!user?.currentTeam) return;
        try {
            const { data } = await api.get('/teams/my-team');
            setTeamData(data);

            // Check if leader
            // Check if leader strict comparison
            const me = data.members.find(m =>
                (m.user._id === user._id) ||
                (String(m.user._id) === String(user._id))
            );
            if (me && me.role === 'leader') {
                setIsLeader(true);
            }
        } catch (err) {
            console.error("Failed to fetch team details", err);
        }
    };

    const handleDeleteTeam = async () => {
        if (window.confirm("Are you sure you want to delete your team? This cannot be undone and all members will be removed from the team.")) {
            try {
                await api.delete(`/teams/${teamData._id}`);
                // Update local user state to remove currentTeam
                const updatedUser = { ...user, currentTeam: null };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                // Reload to refresh context/state
                window.location.reload();
            } catch (err) {
                console.error(err);
                setError('Failed to delete team');
            }
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('email', formData.email);
            if (formData.password) {
                formDataToSend.append('password', formData.password);
            }
            if (avatarFile) {
                formDataToSend.append('avatar', avatarFile);
            }

            const { data } = await api.put('/auth/profile', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Update localStorage with new user data
            localStorage.setItem('user', JSON.stringify(data));
            setSuccess('Profile updated successfully!');
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 flex flex-col items-center justify-center">
            <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-sm z-0"></div>
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
                        <p className="text-violet-100">Update your personal information</p>
                    </div>
                </div>

                <div className="px-8 py-8">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 mb-6 rounded-r">
                            <p className="text-emerald-700">{success}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Avatar Picker */}
                        <div className="flex flex-col items-center mb-8">
                            <div className="relative mb-4 group cursor-pointer">
                                <label htmlFor="avatar-input" className="cursor-pointer block">
                                    <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 relative">
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-violet-100 text-violet-600 text-4xl font-bold">
                                                {user?.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-sm font-semibold">Change</span>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-1 right-1 bg-violet-600 text-white p-2 rounded-full shadow-md border-2 border-white">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                </label>
                                <input
                                    type="file"
                                    id="avatar-input"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </div>
                            <p className="text-xs text-gray-400">Allowed formats: JPG, PNG. Max size: 5MB</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                New Password <span className="text-gray-400 font-normal">(Optional)</span>
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                minLength="6"
                                placeholder="Leave blank to keep current password"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-colors"
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
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
                                className="flex-1 py-3 px-4 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Updating...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Team Management Section (Leader Only) */}
            {
                teamData && isLeader && (
                    <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mt-8">
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-6 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-sm z-0"></div>
                            <div className="relative z-10">
                                <h1 className="text-2xl font-bold text-white mb-1">Team Management</h1>
                                <p className="text-emerald-100">Manage your team settings</p>
                            </div>
                        </div>

                        <div className="p-8">
                            <div className="flex flex-col gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-2">
                                    <h3 className="font-bold text-gray-800">{teamData.name}</h3>
                                    <p className="text-sm text-gray-500">{teamData.description || 'No description'}</p>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => navigate(`/team/edit/${teamData._id}`)}
                                        className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 hover:text-violet-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit Team
                                    </button>
                                    <button
                                        onClick={handleDeleteTeam}
                                        className="flex-1 py-3 px-4 bg-white border border-gray-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Delete Team
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Solved Problems Section */}
            <SolvedProblems />

        </div >
    );
};

export default Profile;
