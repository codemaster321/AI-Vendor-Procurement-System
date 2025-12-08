import { AlertCircle, X } from 'lucide-react';

const ErrorMessage = ({ message, onDismiss }) => {
    if (!message) return null;

    return (
        <div className="mb-6 p-4 rounded-xl flex items-start justify-between animate-slide-down"
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.5)' }}>
            <div className="flex items-start space-x-3">
                <AlertCircle className="flex-shrink-0 mt-0.5" size={20} style={{ color: '#fca5a5' }} />
                <p className="text-sm" style={{ color: '#fca5a5' }}>{message}</p>
            </div>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="text-red-400 hover:text-red-300 transition-colors"
                >
                    <X size={18} />
                </button>
            )}
        </div>
    );
};

export default ErrorMessage;
