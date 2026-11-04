import { useState } from 'react';
import { Sparkles, CheckCircle2, AlertCircle, ArrowUp, X } from 'lucide-react';
import { createRFP } from '../services/api';

const EXAMPLES = [
    {
        label: 'Office laptops',
        text: 'We need 20 laptops with 16GB RAM and 15 27-inch monitors for our new office. Budget is $50,000 total, delivery within 30 days, net 30 payment terms and at least 1 year warranty.',
    },
    {
        label: 'Cloud hosting',
        text: 'Looking for a managed cloud hosting provider for 3 production web apps. 99.9% uptime SLA, daily backups, 24/7 support. Budget around $3,000/month, 12-month contract, start within 2 weeks.',
    },
    {
        label: 'Office furniture',
        text: 'Need 40 ergonomic office chairs and 20 standing desks for a 2nd floor fit-out. Budget $35,000, delivery and assembly included, within 6 weeks. Minimum 5 year warranty on chairs.',
    },
];

const CreateRFP = ({ onSuccess, onCancel }) => {
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
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create RFP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && naturalLanguageInput.trim() && !loading) {
            handleSubmit(e);
        }
    };

    const charCount = naturalLanguageInput.trim().length;

    return (
        <div className="card animate-slide-up overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
                <div className="flex items-center gap-2 text-[13px] font-medium text-ink">
                    <Sparkles size={15} className="text-accent" />
                    Draft an RFP with AI
                </div>
                {onCancel && (
                    <button onClick={onCancel} className="btn btn-ghost btn-icon -mr-2" aria-label="Close">
                        <X size={15} />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit}>
                <textarea
                    id="rfp-input"
                    value={naturalLanguageInput}
                    onChange={(e) => setNaturalLanguageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe what you need to buy — quantities, specs, budget, deadline, payment terms, warranty…"
                    rows="5"
                    autoFocus
                    disabled={loading}
                    required
                    className="block w-full resize-none bg-transparent px-5 py-4 text-[15px] leading-relaxed text-ink outline-none placeholder:text-subtle disabled:opacity-60"
                />

                {!charCount && !loading && (
                    <div className="flex flex-wrap items-center gap-2 px-5 pb-4">
                        <span className="text-xs text-subtle">Try:</span>
                        {EXAMPLES.map((ex) => (
                            <button
                                key={ex.label}
                                type="button"
                                onClick={() => setNaturalLanguageInput(ex.text)}
                                className="rounded-full border border-line bg-surface-2 px-3 py-1 text-xs text-muted transition-colors hover:border-line-strong hover:text-ink"
                            >
                                {ex.label}
                            </button>
                        ))}
                    </div>
                )}

                {(error || success || loading) && (
                    <div className="px-5 pb-4">
                        {error && (
                            <div className="alert alert-error">
                                <AlertCircle className="mt-0.5 shrink-0" size={15} />
                                <p>{error}</p>
                            </div>
                        )}
                        {success && (
                            <div className="alert alert-success animate-fade-in">
                                <CheckCircle2 className="mt-0.5 shrink-0" size={15} />
                                <p>RFP created — it's at the top of your list.</p>
                            </div>
                        )}
                        {loading && (
                            <div className="animate-fade-in">
                                <p className="caret mb-2 text-[13px] text-muted">
                                    Reading your request and structuring items, budget and terms
                                </p>
                                <div className="progress-track">
                                    <div className="progress-bar progress-indeterminate bg-accent" />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between gap-4 border-t border-line bg-surface-2 px-5 py-3">
                    <p className="hidden items-center gap-1.5 text-xs text-subtle sm:flex">
                        <span className="kbd">Ctrl</span>
                        <span className="kbd">Enter</span>
                        <span className="ml-1">to generate</span>
                        {charCount > 0 && <span className="num ml-2">· {charCount} chars</span>}
                    </p>
                    <button
                        type="submit"
                        disabled={loading || !charCount || success}
                        className="btn btn-accent ml-auto"
                    >
                        {loading ? <div className="spinner spinner-light h-3.5 w-3.5" /> : <ArrowUp size={15} />}
                        {loading ? 'Generating…' : 'Generate RFP'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateRFP;
