import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Users, TrendingUp, Clock, ArrowRight, Plus, Zap, Target, Brain } from 'lucide-react';
import { getAllRFPs, getAllVendors } from '../services/api';

const DashboardHome = () => {
    const [stats, setStats] = useState({
        totalRFPs: 0,
        sentRFPs: 0,
        draftRFPs: 0,
        totalVendors: 0,
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [rfpsResponse, vendorsResponse] = await Promise.all([
                getAllRFPs(),
                getAllVendors()
            ]);

            const rfpsData = rfpsResponse.data?.data || rfpsResponse.data;
            const vendorsData = vendorsResponse.data?.data || vendorsResponse.data;

            const rfps = Array.isArray(rfpsData) ? rfpsData : [];
            const vendors = Array.isArray(vendorsData) ? vendorsData : [];

            const sentRFPs = rfps.filter(r => r.status === 'Sent').length;
            const draftRFPs = rfps.filter(r => r.status === 'Draft').length;

            const recentActivity = rfps.slice(0, 5).map(rfp => ({
                id: rfp._id,
                title: rfp.title,
                status: rfp.status,
                date: new Date(rfp.createdAt),
                vendorCount: rfp.vendors?.length || 0
            }));

            setStats({
                totalRFPs: rfps.length,
                sentRFPs,
                draftRFPs,
                totalVendors: vendors.length,
                recentActivity
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in">
            <div className="text-center space-y-4 py-6">
                <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-3">
                    Welcome Back
                </h1>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto" style={{ color: '#94a3b8' }}>
                    Streamline your procurement with AI-powered RFP management
                </p>
                <button
                    onClick={() => navigate('/dashboard/rfps')}
                    className="btn-primary inline-flex items-center space-x-2 mt-6"
                >
                    <Plus size={20} />
                    <span>Create New RFP</span>
                </button>
            </div>

            {/* Stats Grid - Solid Colors, No Gradients */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total RFPs */}
                <div className="glass-card-hover animate-slide-up">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-2xl" style={{ background: '#06b6d4' }}>
                            <FileText className="text-white" size={24} />
                        </div>

                    </div>
                    <h3 className="text-5xl font-bold mb-2" style={{
                        background: 'linear-gradient(135deg, #22d3ee, #06b6d4)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>{stats.totalRFPs}</h3>
                    <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>Total RFPs</p>
                </div>

                {/* Sent RFPs */}
                <div className="glass-card-hover animate-slide-up animation-delay-200">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-2xl" style={{ background: '#10b981' }}>
                            <Zap className="text-white" size={24} />
                        </div>

                    </div>
                    <h3 className="text-5xl font-bold mb-2" style={{
                        background: 'linear-gradient(135deg, #22d3ee, #06b6d4)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>{stats.sentRFPs}</h3>
                    <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>Sent to Vendors</p>
                </div>

                {/* Draft RFPs */}
                <div className="glass-card-hover animate-slide-up animation-delay-400">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-2xl" style={{ background: '#f59e0b' }}>
                            <Clock className="text-white" size={24} />
                        </div>
                    </div>
                    <h3 className="text-5xl font-bold mb-2" style={{
                        background: 'linear-gradient(135deg, #22d3ee, #06b6d4)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>{stats.draftRFPs}</h3>
                    <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>Draft RFPs</p>
                </div>

                {/* Total Vendors */}
                <div className="glass-card-hover animate-slide-up animation-delay-600">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 rounded-2xl" style={{ background: '#f97316' }}>
                            <Users className="text-white" size={24} />
                        </div>

                    </div>
                    <h3 className="text-5xl font-bold mb-2" style={{
                        background: 'linear-gradient(135deg, #22d3ee, #06b6d4)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>{stats.totalVendors}</h3>
                    <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>Active Vendors</p>
                </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions - Reduced Gradients */}
                <div className="glass-card animate-slide-up">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 rounded-xl" style={{ background: '#06b6d4' }}>
                            <Target size={20} className="text-white" />
                        </div>
                        <h2 className="text-xl font-bold" style={{ color: '#e2e8f0' }}>Quick Actions</h2>
                    </div>
                    <div className="space-y-3">
                        <Link
                            to="/dashboard/rfps"
                            className="flex items-center justify-between p-4 glass-card-hover group"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-xl" style={{ background: '#06b6d4' }}>
                                    <FileText size={18} className="text-white" />
                                </div>
                                <span className="font-medium" style={{ color: '#e2e8f0' }}>Create New RFP</span>
                            </div>
                            <ArrowRight size={18} className="text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </Link>

                        <Link
                            to="/dashboard/vendors"
                            className="flex items-center justify-between p-4 glass-card-hover group"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-xl" style={{ background: '#f97316' }}>
                                    <Users size={18} className="text-white" />
                                </div>
                                <span className="font-medium" style={{ color: '#e2e8f0' }}>Manage Vendors</span>
                            </div>
                            <ArrowRight size={18} className="text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </Link>

                        <Link
                            to="/dashboard/rfps"
                            className="flex items-center justify-between p-4 glass-card-hover group"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="p-2 rounded-xl" style={{ background: '#10b981' }}>
                                    <Zap size={18} className="text-white" />
                                </div>
                                <span className="font-medium" style={{ color: '#e2e8f0' }}>View All RFPs</span>
                            </div>
                            <ArrowRight size={18} className="text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </Link>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-2 glass-card animate-slide-up">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 rounded-xl" style={{ background: '#f97316' }}>
                            <Clock size={20} className="text-white" />
                        </div>
                        <h2 className="text-xl font-bold" style={{ color: '#e2e8f0' }}>Recent Activity</h2>
                    </div>

                    {stats.recentActivity.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="inline-flex p-6 rounded-3xl mb-4" style={{ background: 'rgba(6, 182, 212, 0.1)' }}>
                                <FileText style={{ color: '#64748b' }} size={48} />
                            </div>
                            <p className="text-lg mb-2" style={{ color: '#94a3b8' }}>No RFPs yet</p>
                            <p className="text-sm mb-6" style={{ color: '#64748b' }}>Create your first RFP to get started</p>
                            <button
                                onClick={() => navigate('/dashboard/rfps')}
                                className="btn-primary inline-flex items-center space-x-2"
                            >
                                <Plus size={18} />
                                <span>Create Your First RFP</span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {stats.recentActivity.map((activity, index) => (
                                <div
                                    key={activity.id}
                                    onClick={() => navigate(`/dashboard/rfp/${activity.id}/compare`)}
                                    className="flex items-center justify-between p-4 glass-card-hover cursor-pointer group"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                                        <div className="p-2.5 rounded-xl" style={{
                                            background: activity.status === 'Sent' ? '#10b981' :
                                                activity.status === 'Draft' ? '#f59e0b' : '#64748b'
                                        }}>
                                            <FileText size={18} className="text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium truncate group-hover:text-cyan-400 transition-colors" style={{ color: '#e2e8f0' }}>{activity.title}</h3>
                                            <div className="flex items-center space-x-3 mt-1">
                                                <span className={`badge ${activity.status === 'Sent' ? 'badge-success' :
                                                    activity.status === 'Draft' ? 'badge-warning' :
                                                        'badge-primary'
                                                    }`}>
                                                    {activity.status}
                                                </span>
                                                <span className="text-xs" style={{ color: '#64748b' }}>
                                                    {activity.vendorCount} vendor{activity.vendorCount !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <ArrowRight size={18} className="text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Feature Highlights - Minimal Design */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card text-center animate-scale-in">
                    <div className="inline-flex p-4 rounded-3xl mb-4" style={{ background: 'rgba(6, 182, 212, 0.15)' }}>
                        <Brain style={{ color: '#22d3ee' }} size={32} />
                    </div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: '#e2e8f0' }}>AI-Powered</h3>
                    <p className="text-sm" style={{ color: '#94a3b8' }}>Natural language RFP creation and intelligent proposal comparison</p>
                </div>
                <div className="glass-card text-center animate-scale-in animation-delay-200">
                    <div className="inline-flex p-4 rounded-3xl mb-4" style={{ background: 'rgba(249, 115, 22, 0.15)' }}>
                        <Zap style={{ color: '#f97316' }} size={32} />
                    </div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: '#e2e8f0' }}>Email Integration</h3>
                    <p className="text-sm" style={{ color: '#94a3b8' }}>Automatic vendor communication and response processing</p>
                </div>
                <div className="glass-card text-center animate-scale-in animation-delay-400">
                    <div className="inline-flex p-4 rounded-3xl mb-4" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                        <TrendingUp style={{ color: '#10b981' }} size={32} />
                    </div>
                    <h3 className="text-lg font-bold mb-2" style={{ color: '#e2e8f0' }}>Fast & Efficient</h3>
                    <p className="text-sm" style={{ color: '#94a3b8' }}>Streamline your procurement process and save time</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
