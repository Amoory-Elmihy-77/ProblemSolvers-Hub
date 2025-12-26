import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Member',
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
        setLoading(true);

        try {
            if (isRegister) {
                // Create FormData for file upload
                const formDataToSend = new FormData();
                formDataToSend.append('name', formData.name);
                formDataToSend.append('email', formData.email);
                formDataToSend.append('password', formData.password);
                formDataToSend.append('role', formData.role);
                if (avatarFile) {
                    formDataToSend.append('avatar', avatarFile);
                }

                const { data } = await api.post('/auth/register', formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                localStorage.setItem('user', JSON.stringify(data));
                navigate('/dashboard');
                window.location.reload();
            } else {
                const { data } = await api.post('/auth/login', {
                    email: formData.email,
                    password: formData.password,
                });
                localStorage.setItem('user', JSON.stringify(data));
                navigate('/dashboard');
                window.location.reload();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-8 pt-10 pb-8 text-center bg-gray-white relative z-10">
                    <div className="bg-violet-600 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-lg shadow-violet-200">
                        💡
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">ProblemSolvers Hub</h1>
                    <p className="text-gray-500 font-medium">
                        {isRegister ? 'Create your account to start solving' : 'Welcome back, solver'}
                    </p>
                </div>

                <div className="px-8 pb-10">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {isRegister && (
                            <>
                                <div className="space-y-1.5">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required={isRegister}
                                        placeholder="John Doe"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all text-sm"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-700">Profile Picture (Optional)</label>
                                    <div className="border border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center bg-gray-50">
                                        {avatarPreview && (
                                            <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-white shadow-sm">
                                                <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <label htmlFor="avatar" className="cursor-pointer bg-white text-violet-600 px-4 py-2 rounded-lg border border-violet-100 text-sm font-bold hover:bg-violet-50 transition-colors">
                                            Click to Upload
                                            <input
                                                type="file"
                                                id="avatar"
                                                name="avatar"
                                                accept="image/*"
                                                onChange={handleAvatarChange}
                                                className="hidden"
                                            />
                                        </label>
                                        <p className="text-xs text-gray-400 mt-2">Max 5MB (JPG, PNG)</p>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="space-y-1.5">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="you@example.com"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all text-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength="6"
                                placeholder="••••••••"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all text-sm"
                            />
                            {isRegister && <p className="text-xs text-gray-400">Minimum 6 characters</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors shadow-lg shadow-gray-200 mt-2"
                        >
                            {loading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">or</span>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-600 mb-3">
                            {isRegister ? 'Already have an account?' : "Don't have an account?"}
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setIsRegister(!isRegister);
                                setError('');
                                setAvatarFile(null);
                                setAvatarPreview(null);
                            }}
                            className="text-violet-600 font-bold hover:underline"
                        >
                            {isRegister ? 'Sign In to your account' : 'Create a new account'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
