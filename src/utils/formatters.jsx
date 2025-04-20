import { format, parse, isValid, parseISO, formatDistanceToNow  } from 'date-fns';

// Format time for display
export const formatTime = (timeString) => {
    if (!timeString) return '';
    const parsed = parse(timeString, 'HH:mm', new Date());
    return format(parsed, 'h:mm a');
};

/**
 * Format date for display, with optional relative formatting
 *
 * This is just an attempt to make date display easier in components.
 * It uses `formatDate` for absolute dates and `getRelativeDate` for relative dates.
 *
 * Try to use `formatDate` for tables and `getRelativeDate` for more detailed displays.
 */
export function formatDisplayDate(date, { relative = false } = {}) {
    if (!date) return "";

    const jsDate = date instanceof Date ? date : date?.toDate?.() || new Date(date);

    if (!jsDate || isNaN(jsDate.getTime())) return "";

    if (relative) return getRelativeDate(jsDate);
    return formatDate(jsDate);
}

// Format date for display
export function formatDate(value) {
    const date = value instanceof Date
        ? value
        : value?.toDate
            ? value.toDate()
            : new Date(value);

    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

// Get relative date for display
export function getRelativeDate(dateValue) {
    if (!dateValue) return "—";

    let parsedDate;

    // Handle Firestore Timestamps and native JS Dates
    if (typeof dateValue?.toDate === "function") {
        parsedDate = dateValue.toDate();
    } else if (dateValue instanceof Date) {
        parsedDate = dateValue;
    } else if (typeof dateValue === "string") {
        parsedDate = parseISO(dateValue);
    } else if (typeof dateValue === "object" && dateValue.seconds) {
        parsedDate = new Date(dateValue.seconds * 1000);
    } else {
        return "—";
    }

    if (!isValid(parsedDate)) return "—";

    return formatDistanceToNow(parsedDate, { addSuffix: true });
}
