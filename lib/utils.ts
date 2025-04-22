import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines multiple class names into a single string, resolving Tailwind CSS conflicts
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date to a human-readable string
 * @param date Date to format (Date object or ISO string)
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('default', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Formats a date to a short human-readable string (date only)
 * @param date Date to format (Date object or ISO string)
 * @returns Formatted date string (short format)
 */
export function formatShortDate(date: Date | string): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('default', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(dateObj);
}

/**
 * Format a currency amount
 * @param amount Amount to format
 * @param currency Currency code (default: EUR)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('default', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Truncates a string if it exceeds the maximum length
 * @param str String to truncate
 * @param maxLength Maximum length
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

/**
 * Creates a range of numbers from start to end (inclusive)
 * @param start Start value
 * @param end End value (inclusive)
 * @returns Array of numbers
 */
export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Delays execution for a specified number of milliseconds
 * @param ms Milliseconds to delay
 * @returns Promise that resolves after delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generates a random ID
 * @returns Random ID string
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Shuffles an array (Fisher-Yates algorithm)
 * @param array Array to shuffle
 * @returns New shuffled array
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}