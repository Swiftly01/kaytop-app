import dayjs from 'dayjs';

/**
 * Comprehensive date formatting utilities
 * Uses dayjs for consistent and robust date handling across the application
 */

export interface DateFormatOptions {
  fallback?: string;
  format?: string;
}

/**
 * Format date with robust error handling
 * @param date - Date string, Date object, or null/undefined
 * @param options - Formatting options
 * @returns Formatted date string or fallback value
 */
export function formatDate(
  date: string | Date | null | undefined, 
  options: DateFormatOptions = {}
): string {
  const { fallback = 'N/A', format = 'MMM DD, YYYY' } = options;
  
  if (!date) return fallback;
  
  try {
    const dateObj = dayjs(date);
    
    if (!dateObj.isValid()) {
      console.warn(`Invalid date provided: ${date}`);
      return fallback;
    }
    
    return dateObj.format(format);
  } catch (error) {
    console.error(`Error formatting date: ${date}`, error);
    return fallback;
  }
}

/**
 * Format date and time with robust error handling
 */
export function formatDateTime(
  date: string | Date | null | undefined,
  options: DateFormatOptions = {}
): string {
  const { fallback = 'N/A', format = 'MMM DD, YYYY h:mm A' } = options;
  return formatDate(date, { fallback, format });
}

/**
 * Format date for customer tables (consistent format across dashboards)
 */
export function formatCustomerDate(date: string | Date | null | undefined): string {
  return formatDate(date, { 
    fallback: 'N/A', 
    format: 'MMM DD, YYYY' 
  });
}

/**
 * Format date for transaction displays
 */
export function formatTransactionDate(date: string | Date | null | undefined): string {
  return formatDate(date, { 
    fallback: 'N/A', 
    format: 'MMM DD, YYYY' 
  });
}

/**
 * Format date for loan displays
 */
export function formatLoanDate(date: string | Date | null | undefined): string {
  return formatDate(date, { 
    fallback: 'N/A', 
    format: 'MMM DD, YYYY' 
  });
}

/**
 * Check if a date string/object is valid
 */
export function isValidDate(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  
  try {
    return dayjs(date).isValid();
  } catch {
    return false;
  }
}

/**
 * Get relative time (e.g., "2 days ago") - simplified version
 */
export function getRelativeTime(date: string | Date | null | undefined): string {
  if (!date || !isValidDate(date)) return 'N/A';
  
  try {
    const now = dayjs();
    const target = dayjs(date);
    const diffInDays = now.diff(target, 'day');
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  } catch {
    return 'N/A';
  }
}