import { Link } from 'react-router-dom';
import { Brain, Zap, TrendingUp, Users, Mail, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';

const LandingPage = () => {
    const features = [
        {
            icon: Brain,
            title: 'AI-Powered RFP Creation',
            description: 'Transform natural language into structured RFPs in seconds. No templates, no hassle.',
            color: '#06b6d4'
        },
        {
            icon: Zap,
            title: 'Instant Email Integration',
            description: 'Automatically send RFPs to vendors and receive responses directly in the platform.',
            color: '#f97316'
        },
        {
            icon: TrendingUp,
            title: 'Smart Proposal Analysis',
            description: 'AI compares vendor proposals and provides intelligent recommendations instantly.',
            color: '#10b981'
        },
        {
            icon: Users,
            title: 'Vendor Management',
            description: 'Maintain a comprehensive database of vendors with categories and contact info.',
            color: '#8b5cf6'
        }
    ];

    const benefits = [
        'Save 80% time on RFP creation',
        'Get AI-driven vendor recommendations',
        'Track all proposals in one place',
        'Make faster, data-driven decisions',
        'Reduce procurement costs',
        'Automate email communication'
    ];

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Animated background blobs */}
            <div className="bg-blob top-20 left-20 w-96 h-96" style={{ background: '#06b6d4' }} />
            <div className="bg-blob top-40 right-20 w-80 h-80 animation-delay-400" style={{ background: '#f97316' }} />
            <div className="bg-blob bottom-20 left-1/3 w-72 h-72 animation-delay-600" style={{ background: '#06b6d4' }} />

            {/* Navbar */}
            <nav className="relative z-10 px-6 py-6">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-xl blur opacity-75" style={{ background: 'linear-gradient(135deg, #06b6d4, #f97316)' }}></div>
                            <div className="relative p-2 rounded-xl" style={{ background: 'rgba(15, 22, 41, 0.8)' }}>
                                <img src="/logo.jpg" alt="AI RFP Manager" className="w-8 h-8 object-contain" />
                            </div>
                        </div>
                        <span className="text-xl font-bold gradient-text">
                            AI RFP Manager
                        </span>
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex items-center space-x-3">
                        <Link to="/login" className="btn-secondary">
                            Login
                        </Link>
                        <Link to="/signup" className="btn-primary">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 px-6 py-20 md:py-32">
                <div className="max-w-4xl mx-auto text-center animate-fade-in">
                    <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full mb-8 glass-card">
                        <Sparkles size={16} style={{ color: '#22d3ee' }} />
                        <span className="text-sm font-medium" style={{ color: '#94a3b8' }}>
                            AI-Powered Procurement Platform
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
                        Procurement Made Simple
                    </h1>

                    <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto" style={{ color: '#94a3b8' }}>
                        Create RFPs in seconds, not hours. Let AI handle vendor communication and proposal analysis while you make faster, smarter decisions.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <Link
                            to="/signup"
                            className="btn-primary inline-flex items-center space-x-2 text-lg px-8 py-4"
                        >
                            <span>Start Free Trial</span>
                            <ArrowRight size={20} />
                        </Link>
                        <Link
                            to="/login"
                            className="btn-secondary text-lg px-8 py-4"
                        >
                            Watch Demo
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                        <div className="animate-slide-up">
                            <div className="text-4xl font-bold gradient-text mb-2">80%</div>
                            <div className="text-sm" style={{ color: '#64748b' }}>Time Saved</div>
                        </div>
                        <div className="animate-slide-up animation-delay-200">
                            <div className="text-4xl font-bold gradient-text mb-2">10x</div>
                            <div className="text-sm" style={{ color: '#64748b' }}>Faster Analysis</div>
                        </div>
                        <div className="animate-slide-up animation-delay-400">
                            <div className="text-4xl font-bold gradient-text mb-2">100%</div>
                            <div className="text-sm" style={{ color: '#64748b' }}>Automated</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative z-10 px-6 py-20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
                            Everything You Need
                        </h2>
                        <p className="text-xl" style={{ color: '#94a3b8' }}>
                            Powerful features to transform your procurement process
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="glass-card-hover animate-slide-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="p-3 rounded-2xl flex-shrink-0" style={{ background: `${feature.color}20`, border: `1px solid ${feature.color}40` }}>
                                        <feature.icon size={32} style={{ color: feature.color }} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold mb-2" style={{ color: '#e2e8f0' }}>
                                            {feature.title}
                                        </h3>
                                        <p style={{ color: '#94a3b8' }}>
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="relative z-10 px-6 py-20">
                <div className="max-w-5xl mx-auto">
                    <div className="glass-card">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#e2e8f0' }}>
                                Why Choose AI RFP Manager?
                            </h2>
                            <p className="text-lg" style={{ color: '#94a3b8' }}>
                                Built for modern procurement teams
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {benefits.map((benefit, index) => (
                                <div
                                    key={index}
                                    className="flex items-center space-x-3 p-4 rounded-lg transition-all hover:bg-white/5"
                                >
                                    <CheckCircle size={24} style={{ color: '#10b981' }} className="flex-shrink-0" />
                                    <span className="text-lg" style={{ color: '#e2e8f0' }}>
                                        {benefit}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 px-6 py-20">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="glass-card">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
                            Ready to Transform Your Procurement?
                        </h2>
                        <p className="text-xl mb-10" style={{ color: '#94a3b8' }}>
                            Join innovative companies using AI to streamline their RFP process
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/signup"
                                className="btn-primary inline-flex items-center space-x-2 text-lg px-8 py-4"
                            >
                                <span>Get Started Free</span>
                                <ArrowRight size={20} />
                            </Link>
                            <div className="text-sm" style={{ color: '#64748b' }}>
                                No credit card required
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 px-6 py-12 border-t" style={{ borderColor: 'rgba(6, 182, 212, 0.2)' }}>
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="p-2 rounded-xl" style={{ background: 'rgba(15, 22, 41, 0.8)' }}>
                            <img src="/logo.jpg" alt="AI RFP Manager" className="w-6 h-6 object-contain" />
                        </div>
                        <span className="font-bold" style={{ color: '#e2e8f0' }}>AI RFP Manager</span>
                    </div>
                    <p className="text-sm" style={{ color: '#64748b' }}>
                        © 2024 AI RFP Manager. Transforming procurement with artificial intelligence.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
