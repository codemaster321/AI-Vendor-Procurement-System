import { useState } from 'react';
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { createRFP } from '../services/api';

const CreateRFP = ({ onSuccess }) => {
    const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const response = await createRFP({ naturalLanguageInput });
            setSuccess(true);
            setNaturalLanguageInput('');
            setTimeout(() => {
                setSuccess(false);
                if (onSuccess) onSuccess(response.data);
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create RFP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-purple-900/30 via-blue-900/20 to-purple-900/30 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20 shadow-2xl">
            {/* Header */}
            <div className="flex items-start space-x-4 mb-8">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                    <Sparkles className="text-white" size={24} />
                </div>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">Create New RFP</h2>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Describe your procurement needs in plain language. Our AI will structure it into a professional RFP.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Input Field */}
                <div>
                    <label htmlFor="rfp-input" className="block text-sm font-semibold text-gray-300 mb-3">
                        What do you need to procure?
                    </label>
                    <textarea
                        id="rfp-input"
                        value={naturalLanguageInput}
                        onChange={(e) => setNaturalLanguageInput(e.target.value)}
                        placeholder="Example: I need to procure laptops and monitors for our new office. Budget is $50,000 total. Need delivery within 30 days. We need 20 laptops with 16GB RAM and 15 monitors 27-inch. Payment terms should be net 30, and we need at least 1 year warranty."
                        rows="8"
                        className="w-full px-5 py-4 bg-black/40 border-2 border-purple-500/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none leading-relaxed"
                        required
                    />
                    <p className="mt-3 text-xs text-gray-500">
                        💡 Tip: Include budget, quantity, specifications, deadlines, and special requirements
                    </p>
                </div>

                {/* Error State */}
                {error && (
                    <div className="flex items-start space-x-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                        <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-red-300 font-medium text-sm">Error</p>
                            <p className="text-red-400/90 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {/* Success State */}
                {success && (
                    <div className="flex items-start space-x-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl animate-in fade-in duration-300">
                        <CheckCircle2 className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-green-300 font-medium text-sm">Success!</p>
                            <p className="text-green-400/90 text-sm mt-1">RFP created successfully. Redirecting...</p>
                        </div>
                    </div>
                )}

                {/* AI Processing Modal */}
                {loading && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
                        <div className="bg-gradient-to-br from-slate-900 to-purple-900/80 rounded-2xl p-8 border border-purple-500/30 shadow-2xl max-w-md w-full mx-4 animate-scale-in">
                            <div className="text-center">
                                <div className="relative mx-auto w-24 h-24 mb-6">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse"></div>
                                    <div className="absolute inset-0 rounded-full border-4 border-purple-400 border-t-transparent animate-spin"></div>
                                    <div className="absolute inset-3 rounded-full border-4 border-pink-400/40 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                                    <Sparkles className="absolute inset-0 m-auto text-purple-300" size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">AI Processing</h3>
                                <p className="text-gray-400 mb-6">Transforming your description into a structured RFP...</p>
                                <div className="space-y-3 text-left">
                                    <div className="flex items-center space-x-3 bg-black/30 rounded-lg p-3">
                                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                        <span className="text-sm text-gray-300">Analyzing your requirements...</span>
                                    </div>
                                    <div className="flex items-center space-x-3 bg-black/30 rounded-lg p-3">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                                        <span className="text-sm text-gray-300">Extracting budget & timeline...</span>
                                    </div>
                                    <div className="flex items-center space-x-3 bg-black/30 rounded-lg p-3">
                                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                                        <span className="text-sm text-gray-300">Structuring items & specs...</span>
                                    </div>
                                </div>
                                <div className="mt-6 h-2 bg-purple-900/50 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <p className="text-sm text-gray-500">
                        {naturalLanguageInput.trim().length > 0 ? `${naturalLanguageInput.trim().length} characters` : 'Start typing...'}
                    </p>
                    <button
                        type="submit"
                        disabled={loading || !naturalLanguageInput.trim() || success}
                        className="group flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                    >
                        <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
                        <span>{loading ? 'Processing...' : 'Generate RFP'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateRFP;
