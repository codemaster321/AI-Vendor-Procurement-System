import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    Mail,
    Sparkles,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    Wifi,
    Search,
    FileCheck,
    XCircle,
    X,
    Info,
    ChevronRight,
    Plus,
    Minus,
} from 'lucide-react';
import { getRFPById, getProposalsByRFP, compareProposals, createProposal } from '../services/api';
import { useEmailFetchSSE } from '../hooks/useEmailFetchSSE';
import { formatMoney, getInitials, statusBadge } from '../lib/format';

const scoreTone = (score) => (score >= 75 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-danger');
const scoreBar = (score) => (score >= 75 ? 'bg-success' : score >= 50 ? 'bg-warning' : 'bg-danger');

const ProposalComparison = () => {
    const { id } = useParams();
    const [rfp, setRfp] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(true);
    const [analyzing, setAnalyzing] = useState(false);
    const [showManualForm, setShowManualForm] = useState(false);
    const [manualProposal, setManualProposal] = useState({
        vendorId: '',
        rawEmail: '',
    });
    const [notification, setNotification] = useState({
        show: false,
        type: '',
        message: '',
    });

    // SSE hook for email fetching
    const {
        isLoading: fetchingEmails,
        progress: emailProgress,
        error: emailError,
        fetchEmails: fetchEmailsSSE,
        cancel: cancelFetch,
        reset: resetFetch,
    } = useEmailFetchSSE();

    const showNotification = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => setNotification({ show: false, type: '', message: '' }), 4000);
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rfpRes, proposalsRes] = await Promise.all([getRFPById(id), getProposalsByRFP(id)]);
            setRfp(rfpRes.data);
            setProposals(proposalsRes.data);
            // Show the last saved AI analysis, if any
            if (rfpRes.data?.analysis) setComparison(rfpRes.data.analysis);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCompare = async () => {
        if (proposals.length === 0) {
            alert('No proposals to compare');
            return;
        }

        setAnalyzing(true);
        try {
            const response = await compareProposals(id);
            setComparison(response.data);
            showNotification('success', 'AI analysis complete!');
        } catch (error) {
            console.error('Error comparing proposals:', error);
            showNotification('error', error.response?.data?.message || 'Failed to compare proposals');
        } finally {
            setAnalyzing(false);
        }
    };

    const handleFetchEmails = async () => {
        try {
            await fetchEmailsSSE(id, {
                onComplete: (data) => {
                    const count = data?.newProposals || 0;
                    showNotification('success', count > 0 ? `Found ${count} new proposal(s)!` : 'No new proposals found');
                    fetchData();
                },
                onError: (errorMessage) => {
                    showNotification('error', errorMessage || 'Failed to fetch emails. Check email configuration.');
                },
            });
        } catch (error) {
            console.error('Error fetching emails:', error);
            // Error handling is done in onError callback
        }
    };

    // Helper function to get the appropriate icon for each stage
    const getStageIcon = (stage) => {
        switch (stage) {
            case 'connecting':
            case 'initializing':
                return <Wifi size={13} />;
            case 'searching':
                return <Search size={13} />;
            case 'parsing':
            case 'processing':
                return <FileCheck size={13} />;
            case 'complete':
                return <CheckCircle2 size={13} />;
            case 'error':
                return <XCircle size={13} />;
            default:
                return <Mail size={13} />;
        }
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        try {
            await createProposal({
                rfpId: id,
                vendorId: manualProposal.vendorId,
                rawEmail: manualProposal.rawEmail,
            });
            setShowManualForm(false);
            setManualProposal({ vendorId: '', rawEmail: '' });
            showNotification('success', 'Proposal added successfully!');
            fetchData();
        } catch (error) {
            console.error('Error creating proposal:', error);
            showNotification('error', 'Failed to create proposal');
        }
    };

    const vendorName = (vendorId) =>
        proposals.find((p) => p.vendorId?._id === vendorId)?.vendorId?.name || 'Unknown vendor';

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="spinner spinner-lg" />
            </div>
        );
    }

    const recommendedId = comparison?.recommendation?.recommendedVendorId;
    const prices = proposals.map((p) => p.parsedData?.totalPrice).filter((n) => typeof n === 'number');
    const lowestPrice = prices.length > 1 ? Math.min(...prices) : null;
    const aiScore = (vendorId) => comparison?.vendorScores?.find((s) => s.vendorId === vendorId)?.score;

    const rows = [
        {
            label: 'Total price',
            render: (p) => {
                const d = p.parsedData;
                if (!d?.totalPrice) return <span className="text-subtle">—</span>;
                return (
                    <span className="flex items-center gap-2">
                        <span className="num font-medium text-ink">{formatMoney(d.totalPrice, d.currency || 'USD')}</span>
                        {d.totalPrice === lowestPrice && <span className="badge badge-success">Lowest</span>}
                    </span>
                );
            },
        },
        { label: 'Delivery', render: (p) => p.parsedData?.deliveryTime || <span className="text-subtle">—</span> },
        { label: 'Payment terms', render: (p) => p.parsedData?.paymentTerms || <span className="text-subtle">—</span> },
        { label: 'Warranty', render: (p) => p.parsedData?.warranty || <span className="text-subtle">—</span> },
        { label: 'Line items', render: (p) => <span className="num">{p.parsedData?.items?.length || 0}</span> },
        {
            label: 'Score',
            render: (p) => {
                const s = aiScore(p.vendorId?._id) ?? p.score;
                if (s === undefined || s === null) return <span className="text-subtle">Run analysis</span>;
                return (
                    <span className="flex items-center gap-2.5">
                        <span className={`num font-medium ${scoreTone(s)}`}>{s}</span>
                        <span className="progress-track w-16">
                            <span className={`block h-full rounded-full ${scoreBar(s)}`} style={{ width: `${Math.min(s, 100)}%` }} />
                        </span>
                    </span>
                );
            },
        },
    ];

    const toastIcon =
        notification.type === 'success' ? (
            <CheckCircle2 className="shrink-0 text-[#7ee2a8]" size={16} />
        ) : notification.type === 'error' ? (
            <AlertCircle className="shrink-0 text-[#ff9b8a]" size={16} />
        ) : (
            <Info className="shrink-0 text-white/70" size={16} />
        );

    return (
        <div className="space-y-10 animate-fade-in">
            {/* Toast */}
            {notification.show && (
                <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 animate-slide-up">
                    <div className="toast">
                        {toastIcon}
                        <span>{notification.message}</span>
                        <button
                            onClick={() => setNotification({ show: false, type: '', message: '' })}
                            className="ml-1 rounded p-1 text-white/60 hover:bg-white/10 hover:text-white"
                            aria-label="Dismiss"
                        >
                            <X size={13} />
                        </button>
                    </div>
                </div>
            )}

            {/* Email fetching — non-blocking */}
            {fetchingEmails && (
                <div className="fixed bottom-6 right-6 z-50 w-80 animate-slide-up">
                    <div className="card p-4 shadow-[0_20px_50px_-15px_rgba(19,41,75,0.35)]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[13px] font-medium text-ink">
                                <div className="spinner h-3.5 w-3.5" />
                                Checking inbox
                            </div>
                            <button
                                onClick={() => {
                                    cancelFetch();
                                    showNotification('info', 'Email fetch cancelled');
                                }}
                                className="btn btn-ghost btn-sm h-6 px-2"
                            >
                                Cancel
                            </button>
                        </div>
                        <div className="mt-3 flex justify-between text-xs text-muted">
                            <span className="flex items-center gap-1.5 capitalize">
                                {getStageIcon(emailProgress.stage)}
                                {emailProgress.stage || 'Starting'}
                            </span>
                            <span className="num">{emailProgress.percentage || 0}%</span>
                        </div>
                        <div className="progress-track mt-1.5">
                            <div className="progress-bar bg-accent" style={{ width: `${emailProgress.percentage || 0}%` }} />
                        </div>
                        <p className="mt-2 truncate text-xs text-subtle">{emailProgress.message || 'Initializing…'}</p>
                    </div>
                </div>
            )}

            {/* AI analysis in progress */}
            {analyzing && (
                <div className="modal-backdrop">
                    <div className="modal max-w-sm p-7 text-center">
                        <Sparkles size={22} className="mx-auto animate-pulse text-accent" />
                        <h3 className="display mt-3 text-2xl">Weighing the offers…</h3>
                        <p className="mt-2 text-sm text-muted">
                            Comparing {proposals.length} proposal{proposals.length !== 1 ? 's' : ''} on price, delivery
                            and terms.
                        </p>
                        <div className="progress-track mt-6">
                            <div className="progress-bar progress-indeterminate bg-accent" />
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header>
                <nav className="flex items-center gap-1.5 text-[13px] text-subtle">
                    <Link to="/dashboard/rfps" className="hover:text-ink">
                        RFPs
                    </Link>
                    <ChevronRight size={13} />
                    <span className="truncate text-muted">{rfp?.title}</span>
                </nav>
                <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0">
                        <h1 className="page-title">{rfp?.title}</h1>
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-muted">
                            {rfp?.status && <span className={`badge badge-dot ${statusBadge(rfp.status)}`}>{rfp.status}</span>}
                            {rfp?.budget && (
                                <span>
                                    Budget <span className="num font-medium text-ink">{formatMoney(rfp.budget, rfp.currency)}</span>
                                </span>
                            )}
                            <span>
                                <span className="num font-medium text-ink">{proposals.length}</span> proposal
                                {proposals.length !== 1 ? 's' : ''} received
                            </span>
                        </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                        <button onClick={handleFetchEmails} disabled={fetchingEmails} className="btn btn-secondary">
                            <RefreshCw size={14} className={fetchingEmails ? 'animate-spin' : ''} />
                            {fetchingEmails ? 'Checking…' : 'Check inbox'}
                        </button>
                        <button
                            onClick={handleCompare}
                            disabled={analyzing || proposals.length === 0}
                            className="btn btn-accent"
                        >
                            <Sparkles size={14} />
                            {analyzing ? 'Analyzing…' : comparison ? 'Re-run analysis' : 'Compare with AI'}
                        </button>
                    </div>
                </div>
            </header>

            {/* AI verdict */}
            {comparison && (
                <section className="grid animate-slide-up gap-4 lg:grid-cols-5">
                    {comparison.recommendation && (
                        <div className="relative overflow-hidden rounded-2xl bg-ink p-6 text-white lg:col-span-3 sm:p-8">
                            <div
                                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                                style={{
                                    backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)',
                                    backgroundSize: '18px 18px',
                                }}
                            />
                            <div className="relative">
                                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-white/50">
                                    AI recommendation
                                </p>
                                <p className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
                                    {vendorName(recommendedId)}
                                </p>
                                <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-white/75">
                                    {comparison.recommendation.reasoning}
                                </p>
                                {comparison.recommendation.considerations?.length > 0 && (
                                    <ul className="mt-5 space-y-1.5 border-t border-white/10 pt-4">
                                        {comparison.recommendation.considerations.map((c, i) => (
                                            <li key={i} className="flex gap-2.5 text-[13px] text-white/65">
                                                <span className="font-mono text-white/35">{String(i + 1).padStart(2, '0')}</span>
                                                {c}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}

                    <div className={`card p-6 ${comparison.recommendation ? 'lg:col-span-2' : 'lg:col-span-5'}`}>
                        <p className="eyebrow">Summary</p>
                        <p className="mt-3 text-[13px] leading-relaxed text-muted">{comparison.summary}</p>
                        {comparison.vendorScores?.length > 0 && (
                            <div className="mt-6 space-y-3">
                                <p className="eyebrow">Scores</p>
                                {[...comparison.vendorScores]
                                    .sort((a, b) => b.score - a.score)
                                    .map((s) => (
                                        <div key={s.vendorId}>
                                            <div className="flex justify-between text-[13px]">
                                                <span className="truncate font-medium text-ink">{vendorName(s.vendorId)}</span>
                                                <span className={`num ${scoreTone(s.score)}`}>{s.score}</span>
                                            </div>
                                            <div className="progress-track mt-1.5">
                                                <div
                                                    className={`h-full rounded-full ${scoreBar(s.score)}`}
                                                    style={{ width: `${Math.min(s.score, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Side-by-side comparison */}
            <section>
                <h2 className="display mb-3 text-2xl">Side by side</h2>
                {proposals.length === 0 ? (
                    <div className="card empty-state dot-grid">
                        <p className="display text-2xl">Waiting on vendors.</p>
                        <p className="mt-2 max-w-sm text-sm text-muted">
                            Once vendors reply to your RFP email, check your inbox to pull their proposals in. We'll
                            extract prices, delivery and terms automatically.
                        </p>
                        <button onClick={handleFetchEmails} disabled={fetchingEmails} className="btn btn-secondary mt-6">
                            <RefreshCw size={14} className={fetchingEmails ? 'animate-spin' : ''} />
                            Check inbox
                        </button>
                    </div>
                ) : (
                    <div className="card overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th className="sticky left-0 z-10 w-40 bg-surface-2" />
                                    {proposals.map((p) => {
                                        const isRec = recommendedId && p.vendorId?._id === recommendedId;
                                        return (
                                            <th
                                                key={p._id}
                                                className={`min-w-[200px] normal-case tracking-normal ${isRec ? 'bg-accent-soft' : ''}`}
                                            >
                                                <div className="flex items-center gap-2.5 py-1">
                                                    <span className="avatar">{getInitials(p.vendorId?.name)}</span>
                                                    <div className="min-w-0 font-sans">
                                                        <p className="truncate text-[13px] font-semibold text-ink">
                                                            {p.vendorId?.name || 'Unknown vendor'}
                                                        </p>
                                                        {isRec ? (
                                                            <p className="text-[11px] font-medium text-accent-strong">★ Recommended</p>
                                                        ) : (
                                                            <p className="truncate text-[11px] font-normal text-subtle">
                                                                {p.vendorId?.email}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row) => (
                                    <tr key={row.label}>
                                        <td className="sticky left-0 z-10 bg-surface text-xs font-medium text-muted">
                                            {row.label}
                                        </td>
                                        {proposals.map((p) => {
                                            const isRec = recommendedId && p.vendorId?._id === recommendedId;
                                            return (
                                                <td key={p._id} className={`text-ink ${isRec ? 'bg-accent-soft/40' : ''}`}>
                                                    {row.render(p)}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* Per-vendor detail */}
            {proposals.length > 0 && (
                <section>
                    <h2 className="display mb-3 text-2xl">Proposal details</h2>
                    <div className="card divide-y divide-line overflow-hidden">
                        {proposals.map((proposal) => {
                            const data = proposal.parsedData;
                            const score = comparison?.vendorScores?.find((s) => s.vendorId === proposal.vendorId?._id);
                            return (
                                <details key={proposal._id} className="group">
                                    <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
                                        <ChevronRight size={15} className="text-subtle transition-transform group-open:rotate-90" />
                                        <span className="avatar">{getInitials(proposal.vendorId?.name)}</span>
                                        <span className="flex-1 truncate text-[13px] font-medium text-ink">
                                            {proposal.vendorId?.name || 'Unknown vendor'}
                                        </span>
                                        {data?.totalPrice && (
                                            <span className="num text-[13px] text-muted">
                                                {formatMoney(data.totalPrice, data.currency || 'USD')}
                                            </span>
                                        )}
                                    </summary>

                                    <div className="space-y-5 bg-surface-2 px-5 py-5 sm:pl-[4.25rem]">
                                        {score && (score.strengths?.length > 0 || score.weaknesses?.length > 0) && (
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div>
                                                    <p className="eyebrow mb-2">Strengths</p>
                                                    <ul className="space-y-1.5">
                                                        {score.strengths?.map((s, i) => (
                                                            <li key={i} className="flex gap-2 text-[13px] text-ink">
                                                                <Plus size={14} className="mt-0.5 shrink-0 text-success" />
                                                                {s}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <p className="eyebrow mb-2">Weaknesses</p>
                                                    <ul className="space-y-1.5">
                                                        {score.weaknesses?.map((w, i) => (
                                                            <li key={i} className="flex gap-2 text-[13px] text-ink">
                                                                <Minus size={14} className="mt-0.5 shrink-0 text-danger" />
                                                                {w}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        {data?.items?.length > 0 && (
                                            <div className="overflow-hidden rounded-lg border border-line bg-surface">
                                                <table className="data-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Item</th>
                                                            <th className="text-right">Qty</th>
                                                            <th className="hidden text-right sm:table-cell">Unit</th>
                                                            <th className="text-right">Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {data.items.map((item, idx) => (
                                                            <tr key={idx}>
                                                                <td className="font-medium text-ink">{item.name}</td>
                                                                <td className="num text-right text-muted">{item.quantity ?? '—'}</td>
                                                                <td className="num hidden text-right text-muted sm:table-cell">
                                                                    {item.unitPrice ? `$${item.unitPrice.toLocaleString()}` : '—'}
                                                                </td>
                                                                <td className="num text-right text-ink">
                                                                    $
                                                                    {item.totalPrice?.toLocaleString() ||
                                                                        item.unitPrice?.toLocaleString()}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        {data?.notes && (
                                            <div>
                                                <p className="eyebrow mb-1.5">Notes from vendor</p>
                                                <p className="text-[13px] leading-relaxed text-muted">{data.notes}</p>
                                            </div>
                                        )}

                                        {!data && <p className="text-[13px] text-subtle">No structured data extracted.</p>}
                                    </div>
                                </details>
                            );
                        })}
                    </div>
                </section>
            )}
        </div>
    );
};

export default ProposalComparison;
