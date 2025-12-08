import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, FileText, Users, LogOut, User, Menu, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import DashboardHome from '../components/DashboardHome';
import RFPList from '../components/RFPList';
import VendorManagement from '../components/VendorManagement';
import ProposalComparison from '../components/ProposalComparison';

const Dashboard = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const navigation = [
        { name: 'Dashboard', path: '/dashboard', icon: Home },
        { name: 'RFPs', path: '/dashboard/rfps', icon: FileText },
        { name: 'Vendors', path: '/dashboard/vendors', icon: Users },
    ];

    const isActive = (path) => {
        if (path === '/dashboard' && location.pathname === '/dashboard') return true;
        if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        setShowLogoutModal(false);
        logout();
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Animated background blobs */}
            <div className="bg-blob top-20 left-20 w-96 h-96" style={{ background: '#06b6d4' }} />
            <div className="bg-blob top-40 right-20 w-80 h-80 animation-delay-400" style={{ background: '#f97316' }} />
            <div className="bg-blob bottom-20 left-1/3 w-72 h-72 animation-delay-600" style={{ background: '#06b6d4' }} />

            {/* Navbar */}
            <nav className="sticky top-0 z-50 bg-slate-950/50 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, #06b6d4, #f97316)' }}></div>
                                <div className="relative p-2 rounded-xl bg-white/10 backdrop-blur-sm">
                                    <img src="/logo.jpg" alt="AI RFP Manager" className="w-8 h-8 object-contain" />
                                </div>
                            </div>
                            <span className="text-xl font-bold gradient-text hidden sm:block">
                                AI RFP Manager
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-2">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${isActive(item.path)
                                            ? 'text-white'
                                            : 'text-gray-300 hover:bg-white/5 hover:text-white'
                                            }`}
                                        style={isActive(item.path) ? {
                                            background: 'linear-gradient(135deg, #06b6d4, #f97316)',
                                            boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)'
                                        } : {}}
                                    >
                                        <Icon size={18} />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* User Menu (Desktop) */}
                        <div className="hidden md:flex items-center space-x-4">
                            <div className="flex items-center space-x-3 px-2 py-2 ">
                                <div className="p-1.5 rounded-lg" style={{ background: 'linear-gradient(135deg, #06b6d4, #f97316)' }}>
                                    <User size={14} className="text-white" />
                                </div>
                                <span className="text-sm font-medium text-white">{user?.name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                            >
                                <LogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-gray-300 hover:text-white rounded-lg hover:bg-white/5"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-white/10 bg-slate-950/90 backdrop-blur-xl">
                        <div className="px-4 py-4 space-y-2">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all ${isActive(item.path)
                                            ? 'text-white'
                                            : 'text-gray-300 hover:bg-white/5'
                                            }`}
                                        style={isActive(item.path) ? {
                                            background: 'linear-gradient(135deg, #06b6d4, #f97316)',
                                            boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)'
                                        } : {}}
                                    >
                                        <Icon size={20} />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                            <div className="pt-4 border-t border-white/10">
                                <div className="flex items-center space-x-3 px-4 py-3 glass-card mb-2">
                                    <User size={18} />
                                    <span className="text-sm">{user?.name}</span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                >
                                    <LogOut size={18} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Routes>
                    <Route path="/" element={<DashboardHome />} />
                    <Route path="/rfps" element={<RFPList />} />
                    <Route path="/vendors" element={<VendorManagement />} />
                    <Route path="/rfp/:id/compare" element={<ProposalComparison />} />
                </Routes>
            </main>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowLogoutModal(false)}
                    ></div>

                    {/* Modal */}
                    <div className="relative w-full max-w-md animate-scale-in">
                        <div className="glass-card shadow-large">
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-full blur-xl opacity-50" style={{ background: '#ef4444' }}></div>
                                    <div className="relative p-4 rounded-full" style={{ background: 'rgba(239, 68, 68, 0.15)', border: '2px solid rgba(239, 68, 68, 0.3)' }}>
                                        <AlertTriangle size={48} style={{ color: '#fca5a5' }} />
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold mb-3" style={{ color: '#e2e8f0' }}>
                                    Confirm Logout
                                </h2>
                                <p className="text-base" style={{ color: '#94a3b8' }}>
                                    Are you sure you want to logout? You'll need to sign in again to access your dashboard.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowLogoutModal(false)}
                                    className="flex-1 btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmLogout}
                                    className="flex-1 font-medium rounded-xl transition-all"
                                    style={{
                                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                        color: 'white',
                                        padding: '0.875rem 2rem',
                                        boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 6px 24px rgba(239, 68, 68, 0.4)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(239, 68, 68, 0.3)';
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
