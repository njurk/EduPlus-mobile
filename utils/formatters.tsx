export const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};

export const formatAverage = (avg: number | null) => {
    if (avg === null || avg === undefined) return '-';
    return avg.toFixed(2);
};
