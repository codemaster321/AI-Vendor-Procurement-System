import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Building2, AlertCircle, ArrowRight } from 'lucide-react';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        company: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(formData.name, formData.email, formData.password, formData.company);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            {/* Animated background blobs */}
            <div className="bg-blob top-20 left-20 w-96 h-96" style={{ background: '#06b6d4' }} />
            <div className="bg-blob top-40 right-20 w-80 h-80 animation-delay-400" style={{ background: '#f97316' }} />
            <div className="bg-blob bottom-20 left-1/3 w-72 h-72 animation-delay-600" style={{ background: '#06b6d4' }} />

            <div className="w-full max-w-md relative z-10 animate-scale-in">
                {/* Logo */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center space-x-3 mb-6">
                        <div className="relative group">
                            <div className="absolute inset-0 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-all" style={{ background: 'linear-gradient(135deg, #06b6d4, #f97316)' }}></div>
                            <div className="relative p-4 rounded-2xl shadow-xl" style={{ background: 'rgba(15, 22, 41, 0.8)' }}>
                                <img src="/logo.jpg" alt="AI RFP Manager" className="w-12 h-12 object-contain" />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold gradient-text mb-3">
                        Get Started
                    </h1>
                    <p className="text-lg" style={{ color: '#94a3b8' }}>Create your account and start managing RFPs</p>
                </div>

                {/* Signup Form */}
                <div className="glass-card shadow-large">
                    {error && (
                        <div className="mb-6 p-4 rounded-xl flex items-start space-x-3 animate-slide-down" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.5)' }}>
                            <AlertCircle className="flex-shrink-0 mt-0.5" size={20} style={{ color: '#fca5a5' }} />
                            <p className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#e2e8f0' }}>
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2" size={20} style={{ color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                    style={{ paddingLeft: '3rem' }}
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#e2e8f0' }}>
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2" size={20} style={{ color: '#94a3b8' }} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                    style={{ paddingLeft: '3rem' }}
                                    placeholder="john@company.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#e2e8f0' }}>
                                Company (Optional)
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2" size={20} style={{ color: '#94a3b8' }} />
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    className="input-field"
                                    style={{ paddingLeft: '3rem' }}
                                    placeholder="Acme Corp"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#e2e8f0' }}>
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={20} style={{ color: '#94a3b8' }} />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength="6"
                                    className="input-field"
                                    style={{ paddingLeft: '3rem' }}
                                    placeholder="••••••••"
                                />
                            </div>
                            <p className="text-xs mt-1" style={{ color: '#64748b' }}>Minimum 6 characters</p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    <span>Creating Account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm" style={{ color: '#94a3b8' }}>
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold transition-colors inline-flex items-center" style={{ color: '#22d3ee' }}>
                                Sign In
                                <ArrowRight size={14} className="ml-1" />
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
