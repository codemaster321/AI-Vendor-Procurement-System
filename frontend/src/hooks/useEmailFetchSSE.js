import { useState, useCallback, useRef } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Custom hook for SSE-based email fetching with real-time progress
 * @returns {Object} Hook state and methods
 */
export const useEmailFetchSSE = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [progress, setProgress] = useState({
        stage: 'idle',
        percentage: 0,
        message: ''
    });
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const eventSourceRef = useRef(null);

    /**
     * Start fetching emails with SSE progress updates
     * @param {string} rfpId - The RFP ID to fetch emails for
     * @param {Object} options - Optional callbacks
     * @returns {Promise} Resolves when complete or rejects on error
     */
    const fetchEmails = useCallback((rfpId, options = {}) => {
        const { onProgress, onComplete, onError } = options;

        return new Promise((resolve, reject) => {
            // Clean up any existing connection
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }

            setIsLoading(true);
            setError(null);
            setResult(null);
            setProgress({ stage: 'connecting', percentage: 0, message: 'Starting...' });

            // Get auth token from localStorage
            const token = localStorage.getItem('token');

            // Create EventSource with auth token in URL (SSE doesn't support headers)
            const url = `${API_BASE_URL}/proposals/fetch-sse/${rfpId}${token ? `?token=${token}` : ''}`;
            const eventSource = new EventSource(url);
            eventSourceRef.current = eventSource;

            // Handle progress events
            eventSource.addEventListener('progress', (event) => {
                try {
                    const data = JSON.parse(event.data);
                    const newProgress = {
                        stage: data.stage,
                        percentage: data.percentage,
                        message: data.message
                    };
                    setProgress(newProgress);
                    onProgress?.(newProgress);
                } catch (e) {
                    console.error('Failed to parse progress event:', e);
                }
            });

            // Handle completion event
            eventSource.addEventListener('complete', (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setResult(data);
                    setProgress({ stage: 'complete', percentage: 100, message: data.message });
                    setIsLoading(false);
                    eventSource.close();
                    eventSourceRef.current = null;
                    onComplete?.(data);
                    resolve(data);
                } catch (e) {
                    console.error('Failed to parse complete event:', e);
                    setIsLoading(false);
                    eventSource.close();
                    reject(e);
                }
            });

            // Handle error events
            eventSource.addEventListener('error', (event) => {
                let errorMessage = 'Connection failed';

                // Try to parse error data if available
                if (event.data) {
                    try {
                        const data = JSON.parse(event.data);
                        errorMessage = data.message || errorMessage;
                    } catch (e) {
                        // Ignore parse error
                    }
                }

                setError(errorMessage);
                setProgress({ stage: 'error', percentage: 0, message: errorMessage });
                setIsLoading(false);
                eventSource.close();
                eventSourceRef.current = null;
                onError?.(errorMessage);
                reject(new Error(errorMessage));
            });

            // Handle connection error
            eventSource.onerror = (event) => {
                // Only handle if we haven't already processed an error event
                if (eventSourceRef.current) {
                    const errorMessage = 'Connection to server lost';
                    setError(errorMessage);
                    setProgress({ stage: 'error', percentage: 0, message: errorMessage });
                    setIsLoading(false);
                    eventSource.close();
                    eventSourceRef.current = null;
                    onError?.(errorMessage);
                    reject(new Error(errorMessage));
                }
            };
        });
    }, []);

    /**
     * Cancel the current fetch operation
     */
    const cancel = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
            setIsLoading(false);
            setProgress({ stage: 'cancelled', percentage: 0, message: 'Cancelled' });
        }
    }, []);

    /**
     * Reset the hook state
     */
    const reset = useCallback(() => {
        cancel();
        setProgress({ stage: 'idle', percentage: 0, message: '' });
        setResult(null);
        setError(null);
    }, [cancel]);

    return {
        isLoading,
        progress,
        result,
        error,
        fetchEmails,
        cancel,
        reset
    };
};

export default useEmailFetchSSE;
