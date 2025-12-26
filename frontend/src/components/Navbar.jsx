import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsMenuOpen(false);
    };

    return (
        <nav className="sticky top-0 z-50 backdrop-blur-lg bg-white/70 border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Brand */}
                    <Link to="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                        ProblemSolvers Hub
                    </Link>

                    {/* Mobile Menu Button */}
                    {user && (
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="text-gray-600 hover:text-gray-900 focus:outline-none p-2"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    {isMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Desktop Navigation */}
                    {user && (
                        <div className="hidden md:flex items-center space-x-6">
                            <Link to="/dashboard" className="text-gray-600 hover:text-violet-600 font-medium transition-colors">
                                Dashboard
                            </Link>
                            <Link to="/team-selection" className="text-gray-600 hover:text-violet-600 font-medium transition-colors">
                                Teams
                            </Link>

                            <div className="flex items-center space-x-3">
                                <Link to="/add-problem" className="px-3 py-1.5 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors shadow-sm">
                                    Add Problem
                                </Link>
                                <Link to="/create-set" className="px-3 py-1.5 bg-white text-gray-700 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                                    Create Set
                                </Link>
                            </div>

                            {/* User Profile Dropdown/Pill */}
                            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                                <Link to="/profile" className="flex items-center gap-2 group">
                                    {user.avatar ? (
                                        <img
                                            src={`http://localhost:3000${user.avatar}`}
                                            alt={user.name}
                                            className="w-8 h-8 rounded-full border border-gray-200 object-cover"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-sm">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-violet-600 transition-colors">
                                        {user.name}
                                    </span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="text-sm text-gray-400 hover:text-red-500 font-medium transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            {user && isMenuOpen && (
                <div className="md:hidden bg-white border-b border-gray-100 shadow-lg absolute w-full left-0 z-40">
                    <div className="px-4 pt-2 pb-4 space-y-3">
                        <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-violet-600 hover:bg-violet-50">
                            Dashboard
                        </Link>
                        <Link to="/team-selection" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-violet-600 hover:bg-violet-50">
                            Teams
                        </Link>
                        <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-violet-600 hover:bg-violet-50">
                            My Profile
                        </Link>
                        <div className="border-t border-gray-100 my-2 pt-2 grid grid-cols-2 gap-2">
                            <Link to="/add-problem" onClick={() => setIsMenuOpen(false)} className="text-center px-3 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700">
                                Add Problem
                            </Link>
                            <Link to="/create-set" onClick={() => setIsMenuOpen(false)} className="text-center px-3 py-2 bg-gray-50 text-gray-700 border border-gray-200 text-sm font-medium rounded-lg hover:bg-gray-100">
                                Create Set
                            </Link>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-500 hover:bg-red-50"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
