import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Mail, Phone, User, Building, Loader2, X, Save } from 'lucide-react';
import { getAllVendors, createVendor, updateVendor, deleteVendor } from '../services/api';

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
        category: ''
    });
    const [saving, setSaving] = useState(false);

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
            category: vendor.category || ''
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
            category: ''
        });
        setEditingVendor(null);
        setShowForm(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-purple-400" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Vendor Management</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
                >
                    <Plus size={20} />
                    <span>Add Vendor</span>
                </button>
            </div>

            {/* Create/Edit Form */}
            {showForm && (
                <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">
                            {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
                        </h2>
                        <button
                            onClick={resetForm}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Vendor Name *
                                </label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="ABC Corporation"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Email *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="vendor@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Contact Person
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        value={formData.contactPerson}
                                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Phone
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="+1 234 567 8900"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Category
                                </label>
                                <input
                                    type="text"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-3 bg-black/30 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="e.g., IT Equipment, Office Supplies"
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        <span>{editingVendor ? 'Update' : 'Create'} Vendor</span>
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-3 bg-gray-600/50 text-white rounded-lg hover:bg-gray-600/70 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Vendor List */}
            {vendors.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-gray-400 text-lg">No vendors yet. Add your first vendor!</div>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vendors.map((vendor) => (
                        <div
                            key={vendor._id}
                            className="bg-gradient-to-br from-slate-800/60 to-purple-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all shadow-xl group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white mb-1">{vendor.name}</h3>
                                    {vendor.category && (
                                        <span className="inline-block px-3 py-1 text-xs font-semibold bg-purple-500/20 text-purple-300 rounded-full">
                                            {vendor.category}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="flex items-center space-x-2 text-sm text-gray-300">
                                    <Mail size={16} className="text-purple-400" />
                                    <span className="truncate">{vendor.email}</span>
                                </div>
                                {vendor.contactPerson && (
                                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                                        <User size={16} className="text-blue-400" />
                                        <span>{vendor.contactPerson}</span>
                                    </div>
                                )}
                                {vendor.phone && (
                                    <div className="flex items-center space-x-2 text-sm text-gray-300">
                                        <Phone size={16} className="text-green-400" />
                                        <span>{vendor.phone}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center space-x-2 pt-4 border-t border-purple-500/20">
                                <button
                                    onClick={() => handleEdit(vendor)}
                                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600/30 text-blue-300 rounded-lg hover:bg-blue-600/50 transition-all"
                                >
                                    <Edit2 size={16} />
                                    <span>Edit</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(vendor._id)}
                                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600/30 text-red-300 rounded-lg hover:bg-red-600/50 transition-all"
                                >
                                    <Trash2 size={16} />
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VendorManagement;
