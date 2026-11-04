import { AlertCircle, X } from 'lucide-react';

const ErrorMessage = ({ message, onDismiss }) => {
    if (!message) return null;

    return (
        <div className="alert alert-error mb-6 animate-fade-in">
            <AlertCircle className="mt-0.5 shrink-0" size={16} />
            <p className="flex-1">{message}</p>
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="opacity-70 transition-opacity hover:opacity-100"
                    aria-label="Dismiss"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
};

export default ErrorMessage;
