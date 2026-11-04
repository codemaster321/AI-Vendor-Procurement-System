import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ArrowRight } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(formData.email, formData.password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome back."
            subtitle="Sign in to your procurement workspace."
            footer={
                <>
                    New here?{' '}
                    <Link to="/signup" className="font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-accent">
                        Create an account
                    </Link>
                </>
            }
        >
            {error && (
                <div className="alert alert-error mb-5">
                    <AlertCircle className="mt-0.5 shrink-0" size={15} />
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="label">
                        Work email
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        autoFocus
                        className="input h-11"
                        placeholder="you@company.com"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="label">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="input h-11"
                        placeholder="••••••••"
                    />
                </div>

                <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                    {loading ? <div className="spinner spinner-light h-4 w-4" /> : null}
                    {loading ? 'Signing in…' : 'Sign in'}
                    {!loading && <ArrowRight size={16} />}
                </button>
            </form>
        </AuthLayout>
    );
};

export default Login;
