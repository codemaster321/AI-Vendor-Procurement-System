import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import { getAllVendors, createVendor, updateVendor, deleteVendor } from '../services/api';
import { getInitials } from '../lib/format';

const FIELDS = [
    { key: 'name', label: 'Company name', type: 'text', placeholder: 'Acme Supplies Ltd.', required: true },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'sales@acme.com', required: true, hint: 'RFPs are sent to this address.' },
    { key: 'contactPerson', label: 'Contact person', type: 'text', placeholder: 'Jane Doe' },
    { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 234 567 8900' },
    { key: 'category', label: 'Category', type: 'text', placeholder: 'IT Equipment' },
];

const VendorManagement = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingVendor, setEditingVendor] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        contactPerson: '',
        phone: '',
        category: '',
    });
    const [saving, setSaving] = useState(false);
    const [query, setQuery] = useState('');

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const response = await getAllVendors();
            setVendors(response.data);
        } catch (error) {
            console.error('Error fetching vendors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (editingVendor) {
                await updateVendor(editingVendor._id, formData);
            } else {
                await createVendor(formData);
            }
            resetForm();
            fetchVendors();
        } catch (error) {
            console.error('Error saving vendor:', error);
            alert(error.response?.data?.message || 'Failed to save vendor');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (vendor) => {
        setEditingVendor(vendor);
        setFormData({
            name: vendor.name,
            email: vendor.email,
            contactPerson: vendor.contactPerson || '',
            phone: vendor.phone || '',
            category: vendor.category || '',
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this vendor?')) {
            try {
                await deleteVendor(id);
                fetchVendors();
            } catch (error) {
                console.error('Error deleting vendor:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            contactPerson: '',
            phone: '',
            category: '',
        });
        setEditingVendor(null);
        setShowForm(false);
    };

    const list = Array.isArray(vendors) ? vendors : [];
    const q = query.trim().toLowerCase();
    const visible = q
        ? list.filter((v) =>
              [v.name, v.email, v.category, v.contactPerson].some((f) => f?.toLowerCase().includes(q))
          )
        : list;

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="page-title">Vendors</h1>
                    <p className="page-subtitle">The suppliers you send RFPs to and receive proposals from.</p>
                </div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary">
                    <Plus size={15} />
                    Add vendor
                </button>
            </header>

            <section>
                <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="relative w-full max-w-xs">
                        <Search className="input-icon" size={14} />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search vendors…"
                            className="input input-with-icon h-9"
                        />
                    </div>
                    <span className="num shrink-0 text-xs text-subtle">
                        {visible.length} of {list.length}
                    </span>
                </div>

                <div className="card overflow-hidden">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="spinner spinner-lg" />
                        </div>
                    ) : visible.length === 0 ? (
                        <div className="empty-state dot-grid">
                            <p className="display text-2xl">{list.length === 0 ? 'No vendors yet.' : 'No matches.'}</p>
                            <p className="mt-2 max-w-xs text-sm text-muted">
                                {list.length === 0
                                    ? 'Add the suppliers you want to request proposals from.'
                                    : `Nothing matches “${query}”.`}
                            </p>
                            {list.length === 0 && (
                                <button onClick={() => setShowForm(true)} className="btn btn-primary mt-6">
                                    <Plus size={15} />
                                    Add your first vendor
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Vendor</th>
                                        <th>Category</th>
                                        <th className="hidden md:table-cell">Contact</th>
                                        <th className="hidden lg:table-cell">Phone</th>
                                        <th className="text-right">
                                            <span className="sr-only">Actions</span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visible.map((vendor) => (
                                        <tr key={vendor._id} className="row-hover group" onClick={() => handleEdit(vendor)}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <span className="avatar h-8 w-8">{getInitials(vendor.name)}</span>
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium text-ink">{vendor.name}</p>
                                                        <p className="truncate text-xs text-subtle">{vendor.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                {vendor.category ? (
                                                    <span className="badge badge-neutral">{vendor.category}</span>
                                                ) : (
                                                    <span className="text-subtle">—</span>
                                                )}
                                            </td>
                                            <td className="hidden text-muted md:table-cell">{vendor.contactPerson || '—'}</td>
                                            <td className="num hidden text-muted lg:table-cell">{vendor.phone || '—'}</td>
                                            <td className="text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-end gap-0.5 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
                                                    <button
                                                        onClick={() => handleEdit(vendor)}
                                                        className="btn btn-ghost btn-icon"
                                                        title="Edit"
                                                        aria-label="Edit vendor"
                                                    >
                                                        <Pencil size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(vendor._id)}
                                                        className="btn btn-ghost btn-icon hover:bg-danger-soft hover:text-danger"
                                                        title="Delete"
                                                        aria-label="Delete vendor"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>

            {/* Slide-over form */}
            {showForm && (
                <>
                    <div className="drawer-backdrop" onClick={resetForm} />
                    <form onSubmit={handleSubmit} className="drawer">
                        <div className="flex items-start justify-between border-b border-line px-6 py-5">
                            <div>
                                <p className="eyebrow">{editingVendor ? 'Edit vendor' : 'New vendor'}</p>
                                <h2 className="display mt-1 text-2xl">{editingVendor ? editingVendor.name : 'Add a vendor'}</h2>
                            </div>
                            <button type="button" onClick={resetForm} className="btn btn-ghost btn-icon -mr-2" aria-label="Close">
                                <X size={16} />
                            </button>
                        </div>

                        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                            {FIELDS.map((f) => (
                                <div key={f.key}>
                                    <label htmlFor={`vendor-${f.key}`} className="label">
                                        {f.label}
                                        {!f.required && <span className="ml-1 font-normal text-subtle">· optional</span>}
                                    </label>
                                    <input
                                        id={`vendor-${f.key}`}
                                        type={f.type}
                                        value={formData[f.key]}
                                        onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                                        placeholder={f.placeholder}
                                        required={f.required}
                                        className="input"
                                        autoFocus={f.key === 'name'}
                                    />
                                    {f.hint && <p className="mt-1.5 text-xs text-subtle">{f.hint}</p>}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2 border-t border-line bg-surface-2 px-6 py-4">
                            <button type="button" onClick={resetForm} className="btn btn-secondary">
                                Cancel
                            </button>
                            <button type="submit" disabled={saving} className="btn btn-primary">
                                {saving && <div className="spinner spinner-light h-3.5 w-3.5" />}
                                {saving ? 'Saving…' : editingVendor ? 'Save changes' : 'Add vendor'}
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};

export default VendorManagement;
