import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Sparkles } from 'lucide-react';
import { getAllRFPs, getAllVendors } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, formatMoney, statusBadge } from '../lib/format';

const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
};

const DashboardHome = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalRFPs: 0,
        sentRFPs: 0,
        draftRFPs: 0,
        totalVendors: 0,
        recentActivity: [],
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [rfpsResponse, vendorsResponse] = await Promise.all([getAllRFPs(), getAllVendors()]);

            const rfpsData = rfpsResponse.data?.data || rfpsResponse.data;
            const vendorsData = vendorsResponse.data?.data || vendorsResponse.data;

            const rfps = Array.isArray(rfpsData) ? rfpsData : [];
            const vendors = Array.isArray(vendorsData) ? vendorsData : [];

            const sentRFPs = rfps.filter((r) => r.status === 'Sent').length;
            const draftRFPs = rfps.filter((r) => r.status === 'Draft').length;

            const recentActivity = rfps.slice(0, 6).map((rfp) => ({
                id: rfp._id,
                title: rfp.title,
                status: rfp.status,
                date: rfp.createdAt,
                budget: rfp.budget,
                currency: rfp.currency,
                vendorCount: rfp.vendors?.length || 0,
            }));

            setStats({
                totalRFPs: rfps.length,
                sentRFPs,
                draftRFPs,
                totalVendors: vendors.length,
                recentActivity,
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const firstName = user?.name?.split(' ')[0];
    const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    const otherRFPs = Math.max(stats.totalRFPs - stats.sentRFPs - stats.draftRFPs, 0);
    const pct = (n) => (stats.totalRFPs ? (n / stats.totalRFPs) * 100 : 0);

    const metrics = [
        { label: 'Total RFPs', value: stats.totalRFPs },
        { label: 'Sent', value: stats.sentRFPs },
        { label: 'Drafts', value: stats.draftRFPs },
        { label: 'Vendors', value: stats.totalVendors },
    ];

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Greeting */}
            <header>
                <p className="eyebrow">{today}</p>
                <h1 className="page-title mt-2 text-4xl sm:text-5xl">
                    {greeting()}
                    {firstName ? `, ${firstName}` : ''}.
                </h1>
            </header>

            {/* Composer shortcut */}
            <button
                onClick={() => navigate('/dashboard/rfps?new=1')}
                className="card group flex w-full items-center gap-4 p-4 text-left transition-shadow hover:shadow-[0_8px_30px_-12px_rgba(19,41,75,0.25)] sm:p-5"
            >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                    <Sparkles size={18} />
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium text-ink">What do you need to buy?</span>
                    <span className="block truncate text-sm text-subtle">
                        “20 laptops with 16GB RAM, delivered in 30 days, budget $50k…”
                    </span>
                </span>
                <span className="hidden items-center gap-1.5 text-sm font-medium text-ink sm:flex">
                    Draft with AI
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </span>
            </button>

            {/* Metrics */}
            <section className="card overflow-hidden">
                <div className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
                    {metrics.map((m) => (
                        <div key={m.label} className="bg-surface p-5">
                            <p className="eyebrow">{m.label}</p>
                            <p className="num mt-3 text-4xl font-medium text-ink">
                                {loading ? <span className="inline-block h-9 w-10 animate-pulse rounded bg-surface-3" /> : m.value}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="border-t border-line bg-surface-2 px-5 py-4">
                    <div className="flex h-2 overflow-hidden rounded-full bg-surface-3">
                        <div className="bg-success transition-all" style={{ width: `${pct(stats.sentRFPs)}%` }} />
                        <div className="bg-warning transition-all" style={{ width: `${pct(stats.draftRFPs)}%` }} />
                        <div className="bg-subtle transition-all" style={{ width: `${pct(otherRFPs)}%` }} />
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted">
                        <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-success" /> Sent to vendors
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-warning" /> Draft
                        </span>
                        {otherRFPs > 0 && (
                            <span className="flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-subtle" /> Closed
                            </span>
                        )}
                    </div>
                </div>
            </section>

            {/* Recent RFPs */}
            <section>
                <div className="mb-3 flex items-baseline justify-between">
                    <h2 className="display text-2xl">Recent RFPs</h2>
                    <Link
                        to="/dashboard/rfps"
                        className="flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-ink"
                    >
                        View all <ArrowUpRight size={14} />
                    </Link>
                </div>

                <div className="card overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <div className="spinner spinner-lg" />
                        </div>
                    ) : stats.recentActivity.length === 0 ? (
                        <div className="empty-state dot-grid">
                            <p className="display text-2xl">Nothing here yet.</p>
                            <p className="mt-2 max-w-xs text-sm text-muted">
                                Describe what you need in a sentence or two and we'll draft the RFP for you.
                            </p>
                            <button onClick={() => navigate('/dashboard/rfps?new=1')} className="btn btn-primary mt-6">
                                Draft your first RFP
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>RFP</th>
                                        <th>Status</th>
                                        <th className="text-right">Budget</th>
                                        <th className="hidden sm:table-cell">Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.recentActivity.map((activity) => (
                                        <tr
                                            key={activity.id}
                                            className="row-hover"
                                            onClick={() => navigate(`/dashboard/rfp/${activity.id}/compare`)}
                                        >
                                            <td className="max-w-[280px]">
                                                <p className="truncate font-medium text-ink">{activity.title}</p>
                                                <p className="text-xs text-subtle">
                                                    {activity.vendorCount} vendor{activity.vendorCount !== 1 ? 's' : ''}
                                                </p>
                                            </td>
                                            <td>
                                                <span className={`badge badge-dot ${statusBadge(activity.status)}`}>
                                                    {activity.status}
                                                </span>
                                            </td>
                                            <td className="num text-right text-ink">
                                                {activity.budget ? formatMoney(activity.budget, activity.currency) : '—'}
                                            </td>
                                            <td className="hidden text-muted sm:table-cell">{formatDate(activity.date)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default DashboardHome;
