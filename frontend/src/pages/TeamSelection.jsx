import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

const TeamSelection = () => {
    const [teams, setTeams] = useState([]);
    const [search, setSearch] = useState('');
    const [createFormData, setCreateFormData] = useState({ name: '', description: '' });
    const [creating, setCreating] = useState(false);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

    const navigate = useNavigate();

    useEffect(() => {
        fetchTeams();
    }, [search]);

    const fetchTeams = async () => {
        try {
            const { data } = await api.get(`/teams?keyword=${search}`);
            setTeams(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            const { data } = await api.post('/teams', createFormData);
            const updatedUser = { ...user, currentTeam: data._id };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            toast.success('Team created successfully!');
            navigate('/dashboard');
            window.location.reload();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create team');
        } finally {
            setCreating(false);
        }
    };

    const handleJoinTeam = async (teamId) => {
        try {
            await api.post(`/teams/${teamId}/join`);
            toast.success('Join request sent! Please wait for approval.');
            fetchTeams(); // Refresh to show pending status if I update logic to show it
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to join');
        }
    };

    const handleSwitchTeam = async (teamId, teamName) => {
        try {
            await api.post(`/teams/${teamId}/switch`);
            const updatedUser = { ...user, currentTeam: teamId };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            toast.success(`Switched to ${teamName}`);
            navigate('/dashboard');
            window.location.reload();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to switch team');
        }
    };

    // Helper to request safe user ID extraction
    const getUserId = (member) => {
        if (!member.user) return null;
        return typeof member.user === 'object' ? member.user._id : member.user;
    };

    // Filter teams
    const myTeams = teams.filter(team =>
        team.members.some(member => getUserId(member) === user?._id && member.status === 'accepted')
    );

    // Teams I'm not in (or pending)
    const otherTeams = teams.filter(team =>
        !team.members.some(member => getUserId(member) === user?._id && member.status === 'accepted')
    );

    const isPending = (team) => {
        return team.members.some(m => getUserId(m) === user?._id && m.status === 'pending');
    };

    const isLeader = (team) => {
        return team.members.some(m => getUserId(m) === user?._id && m.role === 'leader');
    };

    const [managingTeam, setManagingTeam] = useState(null);

    // ... existing handlers ...

    const handleRespond = async (teamId, userId, status) => {
        try {
            await api.put(`/teams/${teamId}/members/${userId}`, { status });
            toast.success(status === 'accepted' ? 'Member accepted!' : 'Member rejected');

            // Refresh teams to update list locally
            fetchTeams();

            // Update the managing view if open
            if (managingTeam) {
                // Optimization: Update local state to remove the item immediately
                setManagingTeam(prev => ({
                    ...prev,
                    members: prev.members.map(m =>
                        m.user._id === userId ? { ...m, status } : m
                    )
                }));
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update member');
        }
    };

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            {/* Management Modal */}
            {managingTeam && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setManagingTeam(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                            <h2 className="text-xl font-bold text-gray-800">Manage {managingTeam.name}</h2>
                            <button className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100" onClick={() => setManagingTeam(null)}>
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">⏳ Pending Requests</h3>
                                {managingTeam.members.filter(m => m.status === 'pending').length === 0 ? (
                                    <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500 border border-dashed border-gray-200">
                                        No pending requests
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {managingTeam.members
                                            .filter(m => m.status === 'pending')
                                            .map(member => {
                                                const memberId = member.user?._id || member.user;
                                                const memberName = member.user?.name || 'Unknown User';
                                                if (!member.user) return null;

                                                return (
                                                    <div key={memberId} className="flex flex-col sm:flex-row justify-between items-center p-4 bg-amber-50 rounded-xl border border-amber-100 gap-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center font-bold">
                                                                {memberName.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <span className="font-bold text-gray-800 block">{memberName}</span>
                                                                <span className="text-xs text-gray-500">{member.user?.email}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2 w-full sm:w-auto">
                                                            <button
                                                                onClick={() => handleRespond(managingTeam._id, memberId, 'accepted')}
                                                                className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium text-sm transition-colors"
                                                            >
                                                                Accept
                                                            </button>
                                                            <button
                                                                onClick={() => handleRespond(managingTeam._id, memberId, 'rejected')}
                                                                className="flex-1 sm:flex-none px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-colors"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">✅ Active Members</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {managingTeam.members
                                        .filter(m => m.status === 'accepted')
                                        .map(member => {
                                            const memberId = member.user?._id || member.user;
                                            if (!member.user) return null;

                                            return (
                                                <div key={memberId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${member.role === 'leader' ? 'bg-violet-100 text-violet-600' : 'bg-gray-200 text-gray-600'}`}>
                                                            {member.user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-gray-700">{member.user.name}</span>
                                                    </div>
                                                    <span className={`text-xs px-2 py-1 rounded bg-gray-200 text-gray-600 uppercase font-bold ${member.role === 'leader' ? 'bg-violet-100 text-violet-600' : ''}`}>
                                                        {member.role}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto text-center mb-12">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                    Find Your <span className="text-violet-600">Squad</span> 🚀
                </h1>
                <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                    Join an existing team, enter your dashboard, or create a new alliance to start solving together.
                </p>
            </div>

            <div className="max-w-7xl mx-auto space-y-12">
                {/* My Teams Section */}
                {myTeams.length > 0 && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">🏆</span>
                            <h2 className="text-2xl font-bold text-gray-800">My Teams</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myTeams.map(team => (
                                <div key={team._id} className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-violet-100 relative overflow-hidden flex flex-col justify-between">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-violet-500 transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300"></div>

                                    <div className="mb-6">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-violet-600 transition-colors">
                                                {team.name}
                                            </h3>
                                            {isLeader(team) && <span className="bg-violet-100 text-violet-700 text-xs px-2 py-1 rounded-full font-bold">Leader</span>}
                                        </div>
                                        <p className="text-gray-500 text-sm line-clamp-2 mb-4">{team.description}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium bg-gray-50 w-fit px-3 py-1.5 rounded-full">
                                            <span>👥 {team.members.length} Members</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-gray-50">
                                        {isLeader(team) && (
                                            <button
                                                className="px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors font-medium text-sm relative"
                                                onClick={() => setManagingTeam(team)}
                                            >
                                                Manage
                                                {team.members.filter(m => m.status === 'pending').length > 0 && (
                                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                                    </span>
                                                )}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleSwitchTeam(team._id, team.name)}
                                            className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors font-medium text-sm shadow-md shadow-violet-200"
                                        >
                                            Enter Dashboard
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Create Team */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <span>🆕</span> Create a Team
                            </h2>
                            <form onSubmit={handleCreateTeam} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Team Name</label>
                                    <input
                                        type="text"
                                        value={createFormData.name}
                                        onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                                        required
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all"
                                        placeholder="e.g. Code Warriors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        value={createFormData.description}
                                        onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all resize-none h-32"
                                        placeholder="What's your team about?"
                                    />
                                </div>
                                <button type="submit" className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors shadow-lg" disabled={creating}>
                                    {creating ? 'Creating...' : 'Create Team'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Explore Teams */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <span>🔍</span> Explore Teams
                                </h2>
                                <div className="relative w-full sm:w-64">
                                    <input
                                        type="text"
                                        placeholder="Search by name..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-sm"
                                    />
                                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {otherTeams.length === 0 ? (
                                    <div className="col-span-full py-12 text-center">
                                        <p className="text-gray-400">No other teams found matching "{search}"</p>
                                    </div>
                                ) : (
                                    otherTeams.map(team => (
                                        <div key={team._id} className="p-5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all flex flex-col justify-between h-full group">
                                            <div>
                                                <h3 className="font-bold text-gray-800 mb-1 group-hover:text-violet-600 transition-colors">{team.name}</h3>
                                                <p className="text-sm text-gray-500 line-clamp-2 mb-3 h-10">{team.description}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-md font-medium">{team.members.length} members</span>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                {isPending(team) ? (
                                                    <span className="block text-center w-full py-2 bg-amber-100 text-amber-700 text-sm font-bold rounded-lg cursor-not-allowed border border-amber-200">
                                                        ⏳ Pending Approval
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleJoinTeam(team._id)}
                                                        className="w-full py-2 bg-white text-gray-700 border border-gray-200 rounded-lg font-bold text-sm hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                                    >
                                                        Join Team
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamSelection;
