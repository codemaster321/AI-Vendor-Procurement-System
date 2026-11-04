import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ArrowRight } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

const FIELDS = [
    { name: 'name', label: 'Full name', type: 'text', placeholder: 'Jane Doe', autoComplete: 'name', required: true },
    { name: 'email', label: 'Work email', type: 'email', placeholder: 'you@company.com', autoComplete: 'email', required: true },
    { name: 'company', label: 'Company', optional: true, type: 'text', placeholder: 'Acme Corp', autoComplete: 'organization' },
    {
        name: 'password',
        label: 'Password',
        type: 'password',
        placeholder: 'At least 6 characters',
        autoComplete: 'new-password',
        required: true,
        minLength: 6,
    },
];

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        company: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
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
            await register(formData.name, formData.email, formData.password, formData.company);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Start sourcing smarter."
            subtitle="Create your workspace — it takes about 30 seconds."
            footer={
                <>
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-accent">
                        Sign in
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
                {FIELDS.map(({ name, label, optional, ...inputProps }) => (
                    <div key={name}>
                        <label htmlFor={name} className="label">
                            {label}
                            {optional && <span className="ml-1 font-normal text-subtle">· optional</span>}
                        </label>
                        <input
                            id={name}
                            name={name}
                            value={formData[name]}
                            onChange={handleChange}
                            className="input h-11"
                            autoFocus={name === 'name'}
                            {...inputProps}
                        />
                    </div>
                ))}

                <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                    {loading ? <div className="spinner spinner-light h-4 w-4" /> : null}
                    {loading ? 'Creating workspace…' : 'Create account'}
                    {!loading && <ArrowRight size={16} />}
                </button>
            </form>
        </AuthLayout>
    );
};

export default Signup;
