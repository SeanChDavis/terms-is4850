import { format, parse } from 'date-fns';

// Format date for display
export const formatDate = (dateString) => {
    if (!dateString) return '';
    const parsed = parse(dateString, 'yyyy-MM-dd', new Date());
    return format(parsed, 'MMM d, yyyy');
};

// Format time for display
export const formatTime = (timeString) => {
    if (!timeString) return '';
    const parsed = parse(timeString, 'HH:mm', new Date());
    return format(parsed, 'h:mm a');
};

// Get relative date for display
export function getRelativeDate(timestamp) {
    if (!timestamp || !timestamp.toDate) return "—";
    const now = new Date();
    const submitted = timestamp.toDate();
    const diffTime = now - submitted;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
}
