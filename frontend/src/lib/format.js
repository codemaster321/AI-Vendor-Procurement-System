export const getInitials = (name = '') =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || '?';

export const formatDate = (value) =>
    value
        ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        : '—';

export const formatMoney = (amount, currency = 'USD') => {
    if (amount === undefined || amount === null || amount === '') return '—';
    try {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
    } catch {
        return `${currency} ${Number(amount).toLocaleString()}`;
    }
};

export const statusBadge = (status) =>
    status === 'Sent' ? 'badge-success' : status === 'Closed' ? 'badge-neutral' : 'badge-warning';
