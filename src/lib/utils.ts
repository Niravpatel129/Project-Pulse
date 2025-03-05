import { type ClassValue, clsx } from 'clsx';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date for display
 * @param date Date to format
 * @param formatString Format string (default: 'MMM dd, yyyy')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, formatString: string = 'MMM dd, yyyy'): string {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
}

/**
 * Format a date as a relative time (e.g., "2 days ago")
 * @param date Date to format
 * @param addSuffix Whether to add a suffix
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string, addSuffix: boolean = true): string {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix });
}

/**
 * Format a currency amount
 * @param amount Amount to format
 * @param currency Currency code (default: 'USD')
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Truncate a string to a maximum length
 * @param str String to truncate
 * @param maxLength Maximum length (default: 50)
 * @returns Truncated string
 */
export function truncateString(str: string, maxLength: number = 50): string {
  if (!str || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}
