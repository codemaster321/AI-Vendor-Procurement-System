import { Fragment, useState, useEffect } from 'react';
import { Plus, Send, Trash2, X, ChevronRight, BarChart3 } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAllRFPs, deleteRFP, getAllVendors, sendRFPToVendors } from '../services/api';
import CreateRFP from './CreateRFP';
import { formatDate, formatMoney, getInitials, statusBadge } from '../lib/format';

const FILTERS = ['All', 'Draft', 'Sent', 'Closed'];

const RFPList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [rfps, setRfps] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const composerOpen = showCreateForm || searchParams.get('new') === '1';
    const [selectedRFP, setSelectedRFP] = useState(null);
    const [selectedVendors, setSelectedVendors] = useState([]);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [filter, setFilter] = useState('All');
    const [expandedId, setExpandedId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRFPs();
        fetchVendors();
    }, []);

    const fetchRFPs = async () => {
        try {
            const response = await getAllRFPs();
            const rfpsData = response.data?.data || response.data;
            setRfps(Array.isArray(rfpsData) ? rfpsData : []);
        } catch (error) {
            console.error('Error fetching RFPs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchVendors = async () => {
        try {
            const response = await getAllVendors();
            setVendors(response.data);
        } catch (error) {
            console.error('Error fetching vendors:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this RFP?')) {
            try {
                await deleteRFP(id);
                fetchRFPs();
            } catch (error) {
                console.error('Error deleting RFP:', error);
            }
        }
    };

    const handleSendRFP = async () => {
        if (selectedVendors.length === 0) {
            alert('Please select at least one vendor');
            return;
        }

        setSendingEmail(true);
        try {
            const response = await sendRFPToVendors({
                rfpId: selectedRFP._id,
                vendorIds: selectedVendors,
            });
            const failed = (response.data?.results || []).filter((r) => !r.success);
            alert(
                failed.length
                    ? `${response.data.message}.
Could not reach: ${failed.map((r) => r.vendor).join(', ')}`
                    : response.data?.message || 'RFP sent successfully!'
            );
            setSelectedRFP(null);
            setSelectedVendors([]);
            fetchRFPs();
        } catch (error) {
            console.error('Error sending RFP:', error);
            alert(error.response?.data?.message || 'Failed to send RFP');
        } finally {
            setSendingEmail(false);
        }
    };

    const handleVendorToggle = (vendorId) => {
        setSelectedVendors((prev) =>
            prev.includes(vendorId) ? prev.filter((id) => id !== vendorId) : [...prev, vendorId]
        );
    };

    const closeSendModal = () => {
        setSelectedRFP(null);
        setSelectedVendors([]);
    };

    const closeComposer = () => {
        setShowCreateForm(false);
        if (searchParams.get('new')) setSearchParams({}, { replace: true });
    };

    const counts = FILTERS.reduce(
        (acc, f) => ({ ...acc, [f]: f === 'All' ? rfps.length : rfps.filter((r) => r.status === f).length }),
        {}
    );
    const visible = filter === 'All' ? rfps : rfps.filter((r) => r.status === filter);

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="page-title">Requests for proposal</h1>
                    <p className="page-subtitle">Draft with AI, send to vendors, compare what comes back.</p>
                </div>
                {!composerOpen && (
                    <button onClick={() => setShowCreateForm(true)} className="btn btn-primary">
                        <Plus size={15} />
                        New RFP
                    </button>
                )}
            </header>

            {/* Composer */}
            {composerOpen && (
                <CreateRFP
                    onCancel={closeComposer}
                    onSuccess={() => {
                        closeComposer();
                        fetchRFPs();
                    }}
                />
            )}

            {/* List */}
            <section>
                <div className="mb-3 flex items-center gap-1 overflow-x-auto">
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
                                filter === f ? 'bg-surface text-ink ring-1 ring-line' : 'text-muted hover:text-ink'
                            }`}
                        >
                            {f}
                            <span className="num text-xs text-subtle">{counts[f]}</span>
                        </button>
                    ))}
                </div>

                <div className="card overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="spinner spinner-lg" />
                        </div>
                    ) : visible.length === 0 ? (
                        <div className="empty-state dot-grid">
                            <p className="display text-2xl">
                                {rfps.length === 0 ? 'No RFPs yet.' : `No ${filter.toLowerCase()} RFPs.`}
                            </p>
                            <p className="mt-2 max-w-xs text-sm text-muted">
                                {rfps.length === 0
                                    ? 'Describe what you need and let AI draft a structured RFP.'
                                    : 'Try a different filter.'}
                            </p>
                            {rfps.length === 0 && !composerOpen && (
                                <button onClick={() => setShowCreateForm(true)} className="btn btn-primary mt-6">
                                    <Plus size={15} />
                                    Draft your first RFP
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th className="w-8 pr-0" />
                                        <th>Title</th>
                                        <th>Status</th>
                                        <th className="text-right">Budget</th>
                                        <th className="hidden md:table-cell">Deadline</th>
                                        <th className="hidden text-right sm:table-cell">Items</th>
                                        <th className="text-right">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visible.map((rfp) => {
                                        const expanded = expandedId === rfp._id;
                                        return (
                                            <Fragment key={rfp._id}>
                                                <tr
                                                    className="row-hover group"
                                                    onClick={() => setExpandedId(expanded ? null : rfp._id)}
                                                >
                                                    <td className="w-8 pr-0 text-subtle">
                                                        <ChevronRight
                                                            size={15}
                                                            className={`transition-transform ${expanded ? 'rotate-90' : ''}`}
                                                        />
                                                    </td>
                                                    <td className="max-w-[320px]">
                                                        <p className="truncate font-medium text-ink">{rfp.title}</p>
                                                        {rfp.description && (
                                                            <p className="truncate text-xs text-subtle">{rfp.description}</p>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <span className={`badge badge-dot ${statusBadge(rfp.status)}`}>
                                                            {rfp.status}
                                                        </span>
                                                    </td>
                                                    <td className="num whitespace-nowrap text-right text-ink">
                                                        {rfp.budget ? formatMoney(rfp.budget, rfp.currency) : '—'}
                                                    </td>
                                                    <td className="hidden whitespace-nowrap text-muted md:table-cell">
                                                        {formatDate(rfp.deadline)}
                                                    </td>
                                                    <td className="num hidden text-right text-muted sm:table-cell">
                                                        {rfp.items?.length || 0}
                                                    </td>
                                                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                onClick={() => setSelectedRFP(rfp)}
                                                                className="btn btn-secondary btn-sm"
                                                            >
                                                                <Send size={13} />
                                                                <span className="hidden lg:inline">Send</span>
                                                            </button>
                                                            <button
                                                                onClick={() => navigate(`/dashboard/rfp/${rfp._id}/compare`)}
                                                                className="btn btn-secondary btn-sm"
                                                            >
                                                                <BarChart3 size={13} />
                                                                <span className="hidden lg:inline">Proposals</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(rfp._id)}
                                                                className="btn btn-ghost btn-icon h-[1.875rem] w-[1.875rem] hover:bg-danger-soft hover:text-danger"
                                                                title="Delete"
                                                                aria-label="Delete RFP"
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                                {expanded && (
                                                    <tr>
                                                        <td colSpan={7} className="bg-surface-2 px-4 py-4 sm:pl-12">
                                                            {rfp.description && (
                                                                <p className="mb-3 max-w-3xl text-[13px] leading-relaxed text-muted">
                                                                    {rfp.description}
                                                                </p>
                                                            )}
                                                            {rfp.items?.length > 0 ? (
                                                                <div className="overflow-hidden rounded-lg border border-line bg-surface">
                                                                    <table className="data-table">
                                                                        <thead>
                                                                            <tr>
                                                                                <th>Item</th>
                                                                                <th className="text-right">Qty</th>
                                                                                <th>Specs</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {rfp.items.map((item, idx) => (
                                                                                <tr key={idx}>
                                                                                    <td className="font-medium text-ink">{item.name}</td>
                                                                                    <td className="num text-right text-muted">
                                                                                        {item.quantity ?? '—'}
                                                                                    </td>
                                                                                    <td className="text-muted">{item.specs || '—'}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            ) : (
                                                                <p className="text-[13px] text-subtle">No line items.</p>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>

            {/* Send RFP modal */}
            {selectedRFP && (
                <div className="modal-backdrop" onClick={closeSendModal}>
                    <div className="modal flex max-w-lg flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6">
                            <div className="min-w-0">
                                <p className="eyebrow">Send RFP</p>
                                <h3 className="display mt-1 truncate text-2xl">{selectedRFP.title}</h3>
                            </div>
                            <button onClick={closeSendModal} className="btn btn-ghost btn-icon -mr-2" aria-label="Close">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto border-y border-line">
                            {vendors.length === 0 ? (
                                <div className="px-6 py-10 text-center">
                                    <p className="text-sm text-muted">No vendors yet.</p>
                                    <button
                                        onClick={() => navigate('/dashboard/vendors')}
                                        className="btn btn-secondary btn-sm mt-3"
                                    >
                                        Add vendors
                                    </button>
                                </div>
                            ) : (
                                <ul className="divide-y divide-line">
                                    {vendors.map((vendor) => {
                                        const checked = selectedVendors.includes(vendor._id);
                                        return (
                                            <li key={vendor._id}>
                                                <label
                                                    className={`flex cursor-pointer items-center gap-3 px-6 py-3 transition-colors ${
                                                        checked ? 'bg-accent-soft/50' : 'hover:bg-surface-2'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => handleVendorToggle(vendor._id)}
                                                        className="checkbox"
                                                    />
                                                    <span className="avatar">{getInitials(vendor.name)}</span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block text-[13px] font-medium text-ink">
                                                            {vendor.name}
                                                        </span>
                                                        <span className="block truncate text-xs text-subtle">
                                                            {vendor.email}
                                                        </span>
                                                    </span>
                                                    {vendor.category && (
                                                        <span className="badge badge-neutral hidden sm:inline-flex">
                                                            {vendor.category}
                                                        </span>
                                                    )}
                                                </label>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>

                        <div className="flex items-center justify-between gap-3 px-6 py-4">
                            <span className="num text-xs text-subtle">
                                {selectedVendors.length} of {vendors.length} selected
                            </span>
                            <div className="flex gap-2">
                                <button onClick={closeSendModal} className="btn btn-secondary">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendRFP}
                                    disabled={sendingEmail || selectedVendors.length === 0}
                                    className="btn btn-accent"
                                >
                                    {sendingEmail ? <div className="spinner spinner-light h-3.5 w-3.5" /> : <Send size={14} />}
                                    {sendingEmail ? 'Sending…' : 'Send RFP'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RFPList;
