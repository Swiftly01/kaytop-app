/**
 * Format a date as "Month DD, YYYY" (e.g., "June 03, 2024")
 * @param date - Date object or string to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
  }).format(d);
};
