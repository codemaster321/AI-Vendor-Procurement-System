import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, FileText, Building2, LogOut, Menu, X, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import DashboardHome from '../components/DashboardHome';
import RFPList from '../components/RFPList';
import VendorManagement from '../components/VendorManagement';
import ProposalComparison from '../components/ProposalComparison';
import Logo from '../components/Logo';
import { getInitials } from '../lib/format';

const navigation = [
    { name: 'Overview', path: '/dashboard', icon: LayoutGrid },
    { name: 'RFPs', path: '/dashboard/rfps', icon: FileText },
    { name: 'Vendors', path: '/dashboard/vendors', icon: Building2 },
];

const Dashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const isActive = (path) => {
        if (path === '/dashboard') return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
        if (path === '/dashboard/rfps') return location.pathname.startsWith('/dashboard/rfp');
        return location.pathname.startsWith(path);
    };

    const confirmLogout = () => {
        setShowLogoutModal(false);
        logout();
    };

    const closeMenu = () => setMobileMenuOpen(false);

    const sidebar = (
        <div className="flex h-full flex-col">
            <div className="flex h-14 items-center px-4">
                <Logo to="/dashboard" />
            </div>

            <div className="px-3 pt-2">
                <button
                    onClick={() => {
                        closeMenu();
                        navigate('/dashboard/rfps?new=1');
                    }}
                    className="btn btn-primary w-full justify-between"
                >
                    <span className="flex items-center gap-2">
                        <Plus size={15} />
                        New RFP
                    </span>
                    <span className="font-mono text-[11px] text-white/50">AI</span>
                </button>
            </div>

            <nav className="mt-6 flex-1 space-y-0.5 px-3">
                <p className="eyebrow mb-2 px-2">Workspace</p>
                {navigation.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={closeMenu}
                            className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors ${
                                active
                                    ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(19,41,75,0.08)] ring-1 ring-line'
                                    : 'text-muted hover:bg-surface-3 hover:text-ink'
                            }`}
                        >
                            <Icon size={15} className={active ? 'text-accent' : 'text-subtle'} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-line p-3">
                <div className="flex items-center gap-2.5 px-1">
                    <span className="avatar h-8 w-8 bg-surface">{getInitials(user?.name)}</span>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-ink">{user?.name}</p>
                        <p className="truncate text-xs text-subtle">{user?.company || user?.email}</p>
                    </div>
                    <button
                        onClick={() => {
                            closeMenu();
                            setShowLogoutModal(true);
                        }}
                        className="btn btn-ghost btn-icon"
                        title="Log out"
                        aria-label="Log out"
                    >
                        <LogOut size={15} />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen lg:pl-60">
            {/* Desktop sidebar */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-line bg-canvas lg:block">
                {sidebar}
            </aside>

            {/* Mobile top bar */}
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-canvas/90 px-4 backdrop-blur lg:hidden">
                <Logo to="/dashboard" />
                <button onClick={() => setMobileMenuOpen(true)} className="btn btn-ghost btn-icon" aria-label="Open menu">
                    <Menu size={18} />
                </button>
            </header>

            {/* Mobile drawer */}
            {mobileMenuOpen && (
                <>
                    <div className="drawer-backdrop lg:hidden" onClick={closeMenu} />
                    <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-line bg-canvas shadow-2xl animate-fade-in lg:hidden">
                        <button onClick={closeMenu} className="btn btn-ghost btn-icon absolute right-3 top-3" aria-label="Close menu">
                            <X size={16} />
                        </button>
                        {sidebar}
                    </aside>
                </>
            )}

            {/* Main content */}
            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 lg:py-10">
                <Routes>
                    <Route path="/" element={<DashboardHome />} />
                    <Route path="/rfps" element={<RFPList />} />
                    <Route path="/vendors" element={<VendorManagement />} />
                    <Route path="/rfp/:id/compare" element={<ProposalComparison />} />
                </Routes>
            </main>

            {/* Logout confirmation */}
            {showLogoutModal && (
                <div className="modal-backdrop" onClick={() => setShowLogoutModal(false)}>
                    <div className="modal max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
                        <h2 className="display text-2xl">Log out?</h2>
                        <p className="mt-2 text-sm text-muted">You'll need to sign in again to get back to your workspace.</p>
                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={() => setShowLogoutModal(false)} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button onClick={confirmLogout} className="btn btn-danger">
                                Log out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
