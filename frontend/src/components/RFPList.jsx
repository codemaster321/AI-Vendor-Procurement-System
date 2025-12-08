import { useState, useEffect } from 'react';
import { Plus, Send, Eye, Trash2, Clock, DollarSign, Loader2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllRFPs, deleteRFP, getAllVendors, sendRFPToVendors } from '../services/api';
import CreateRFP from './CreateRFP';

const RFPList = () => {
    const [rfps, setRfps] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedRFP, setSelectedRFP] = useState(null);
    const [selectedVendors, setSelectedVendors] = useState([]);
    const [sendingEmail, setSendingEmail] = useState(false);
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
            await sendRFPToVendors({
                rfpId: selectedRFP._id,
                vendorIds: selectedVendors
            });
            alert('RFP sent successfully!');
            setSelectedRFP(null);
            setSelectedVendors([]);
            fetchRFPs();
        } catch (error) {
            console.error('Error sending RFP:', error);
            alert('Failed to send RFP');
        } finally {
            setSendingEmail(false);
        }
    };

    const handleVendorToggle = (vendorId) => {
        setSelectedVendors(prev =>
            prev.includes(vendorId)
                ? prev.filter(id => id !== vendorId)
                : [...prev, vendorId]
        );
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
                <h1 className="text-3xl font-bold text-white">Request for Proposals</h1>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
                >
                    <Plus size={20} />
                    <span>New RFP</span>
                </button>
            </div>

            {/* Create RFP Form */}
            {showCreateForm && (
                <CreateRFP
                    onSuccess={() => {
                        setShowCreateForm(false);
                        fetchRFPs();
                    }}
                />
            )}

            {/* RFP List */}
            {rfps.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-gray-400 text-lg">No RFPs yet. Create your first one!</div>
                </div>
            ) : (
                <div className="grid gap-6">
                    {rfps.map((rfp) => (
                        <div
                            key={rfp._id}
                            className="bg-gradient-to-br from-slate-800/60 to-purple-900/30 backdrop-blur-sm rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all shadow-xl"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-white mb-2">{rfp.title}</h3>
                                    <p className="text-gray-300 text-sm mb-4">{rfp.description}</p>

                                    <div className="flex flex-wrap gap-4 text-sm">
                                        {rfp.budget && (
                                            <div className="flex items-center space-x-2 text-green-400">
                                                <DollarSign size={16} />
                                                <span>{rfp.currency} {rfp.budget.toLocaleString()}</span>
                                            </div>
                                        )}
                                        {rfp.deadline && (
                                            <div className="flex items-center space-x-2 text-blue-400">
                                                <Clock size={16} />
                                                <span>{new Date(rfp.deadline).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center space-x-2 text-purple-400">
                                            <Users size={16} />
                                            <span>{rfp.items?.length || 0} items</span>
                                        </div>
                                    </div>

                                    {rfp.items && rfp.items.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <p className="text-xs text-gray-400 font-semibold">Items:</p>
                                            <div className="grid gap-2">
                                                {rfp.items.map((item, idx) => (
                                                    <div key={idx} className="text-sm text-gray-300 bg-black/20 rounded-lg p-2">
                                                        <span className="font-medium text-white">{item.name}</span>
                                                        {item.quantity && <span className="text-gray-400"> × {item.quantity}</span>}
                                                        {item.specs && <span className="text-gray-400"> - {item.specs}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2 ml-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${rfp.status === 'Sent' ? 'bg-green-500/20 text-green-300 border border-green-500/50' :
                                        rfp.status === 'Closed' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/50' :
                                            'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                                        }`}>
                                        {rfp.status}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 pt-4 border-t border-purple-500/20">
                                <button
                                    onClick={() => setSelectedRFP(rfp)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600/30 text-purple-300 rounded-lg hover:bg-purple-600/50 transition-all"
                                >
                                    <Send size={16} />
                                    <span>Send to Vendors</span>
                                </button>
                                <button
                                    onClick={() => navigate(`/dashboard/rfp/${rfp._id}/compare`)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600/30 text-blue-300 rounded-lg hover:bg-blue-600/50 transition-all"
                                >
                                    <Eye size={16} />
                                    <span>View Proposals</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(rfp._id)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-red-600/30 text-red-300 rounded-lg hover:bg-red-600/50 transition-all ml-auto"
                                >
                                    <Trash2 size={16} />
                                    <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Send RFP Modal */}
            {selectedRFP && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-br from-slate-800 to-purple-900 rounded-2xl p-6 max-w-2xl w-full border border-purple-500/30 shadow-2xl max-h-[80vh] overflow-y-auto">
                        <h3 className="text-2xl font-bold text-white mb-4">Send RFP to Vendors</h3>
                        <p className="text-gray-300 mb-6">Select vendors to receive: <span className="font-semibold text-purple-400">{selectedRFP.title}</span></p>

                        <div className="space-y-3 mb-6">
                            {vendors.length === 0 ? (
                                <p className="text-gray-400">No vendors available. Please add vendors first.</p>
                            ) : (
                                vendors.map((vendor) => (
                                    <label
                                        key={vendor._id}
                                        className="flex items-center space-x-3 p-4 bg-black/30 rounded-lg border border-purple-500/20 hover:border-purple-500/40 cursor-pointer transition-all"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedVendors.includes(vendor._id)}
                                            onChange={() => handleVendorToggle(vendor._id)}
                                            className="w-5 h-5 rounded border-purple-500 text-purple-600 focus:ring-purple-500 focus:ring-offset-slate-900"
                                        />
                                        <div className="flex-1">
                                            <p className="font-semibold text-white">{vendor.name}</p>
                                            <p className="text-sm text-gray-400">{vendor.email}</p>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleSendRFP}
                                disabled={sendingEmail || selectedVendors.length === 0}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
                            >
                                {sendingEmail ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Sending...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        <span>Send RFP ({selectedVendors.length} vendors)</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedRFP(null);
                                    setSelectedVendors([]);
                                }}
                                className="px-6 py-3 bg-gray-600/50 text-white rounded-lg hover:bg-gray-600/70 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RFPList;
