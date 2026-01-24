/**
 * Date Filtering Utilities
 * Helper functions to filter data based on time periods and date ranges
 */

import { subDays, subHours, isWithinInterval, parseISO, isValid } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import type { TimePeriod } from '@/app/_components/ui/FilterControls';

/**
 * Get date range for a given time period
 */
export function getDateRangeForPeriod(period: TimePeriod): DateRange | null {
    if (!period || period === 'custom') return null;

    const now = new Date();

    switch (period) {
        case 'last_24_hours':
            return {
                from: subHours(now, 24),
                to: now
            };
        case 'last_7_days':
            return {
                from: subDays(now, 7),
                to: now
            };
        case 'last_30_days':
            return {
                from: subDays(now, 30),
                to: now
            };
        default:
            return null;
    }
}

/**
 * Check if a date string is within a date range
 */
export function isDateInRange(dateString: string, range: DateRange | undefined | null): boolean {
    if (!range || !range.from) return true; // No filter applied

    try {
        const date = parseISO(dateString);
        if (!isValid(date)) return true; // Invalid date, don't filter out

        const from = range.from;
        const to = range.to || range.from; // If no 'to' date, use 'from' date

        return isWithinInterval(date, { start: from, end: to });
    } catch {
        return true; // On error, don't filter out
    }
}

/**
 * Filter array of items by date field and time period
 */
export function filterByTimePeriod<T extends Record<string, unknown>>(
    items: T[],
    dateField: keyof T,
    period: TimePeriod,
    customRange?: DateRange
): T[] {
    // If no period selected, return all items
    if (!period) return items;

    // Get the appropriate date range
    const range = period === 'custom' ? customRange : getDateRangeForPeriod(period);

    // If no valid range, return all items
    if (!range) return items;

    // Filter items by date range
    return items.filter(item => {
        const dateValue = item[dateField];
        if (!dateValue) return true; // Keep items without dates

        const dateString = typeof dateValue === 'string' ? dateValue : dateValue.toString();
        return isDateInRange(dateString, range);
    });
}

/**
 * Filter array of items by custom date range
 */
export function filterByDateRange<T extends Record<string, unknown>>(
    items: T[],
    dateField: keyof T,
    range: DateRange | undefined
): T[] {
    if (!range || !range.from) return items;

    return items.filter(item => {
        const dateValue = item[dateField];
        if (!dateValue) return true;

        const dateString = typeof dateValue === 'string' ? dateValue : dateValue.toString();
        return isDateInRange(dateString, range);
    });
}
