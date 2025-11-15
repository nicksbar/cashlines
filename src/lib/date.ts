/**
 * Date utilities for filtering and formatting
 */

import { 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear, 
  format, 
  parse,
  isWithinInterval,
  eachMonthOfInterval,
} from 'date-fns'

export function getMonthRange(year: number, month: number): { start: Date; end: Date } {
  const date = new Date(year, month - 1, 1)
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  }
}

export function getYearRange(year: number): { start: Date; end: Date } {
  return {
    start: startOfYear(new Date(year, 0, 1)),
    end: endOfYear(new Date(year, 11, 31)),
  }
}

export function formatDate(dateInput: Date | string, fmt = 'MMM dd, yyyy'): string {
  let dateStr: string
  
  if (typeof dateInput === 'string') {
    // ISO string like "2025-11-01T00:00:00.000Z" - extract the date part
    dateStr = dateInput.split('T')[0]
  } else {
    // Date object - convert to ISO and extract date part
    dateStr = dateInput.toISOString().split('T')[0]
  }
  
  // Parse YYYY-MM-DD string using date-fns to avoid timezone shifts
  const d = parse(dateStr, 'yyyy-MM-dd', new Date())
  return format(d, fmt)
}

/**
 * Safe date formatter that extracts the date portion from ISO strings
 */
export function formatDateString(dateInput: string | Date, fmt = 'MMM dd, yyyy'): string {
  let dateStr: string
  
  if (typeof dateInput === 'string') {
    // ISO string like "2025-11-01T00:00:00.000Z" - extract the date part
    dateStr = dateInput.split('T')[0]
  } else {
    // Date object - convert to ISO and extract date part
    dateStr = dateInput.toISOString().split('T')[0]
  }
  
  // Parse YYYY-MM-DD string
  const [year, month, day] = dateStr.split('-').map(Number)
  
  // Create a date object and format it
  const d = parse(dateStr, 'yyyy-MM-dd', new Date())
  return format(d, fmt)
}

export function formatMonth(year: number, month: number): string {
  return format(new Date(year, month - 1, 1), 'MMMM yyyy')
}

export function isDateInRange(
  date: Date,
  start: Date,
  end: Date
): boolean {
  return isWithinInterval(date, { start, end })
}

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date()
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  }
}

export function getMonthName(month: number): string {
  return format(new Date(2024, month - 1, 1), 'MMMM')
}

export function getMonthsInRange(
  startYear: number,
  startMonth: number,
  endYear: number,
  endMonth: number
): Array<{ year: number; month: number }> {
  const start = new Date(startYear, startMonth - 1, 1)
  const end = new Date(endYear, endMonth - 1, 1)
  
  const months: Array<{ year: number; month: number }> = []
  const current = new Date(start)
  
  while (current <= end) {
    months.push({
      year: current.getFullYear(),
      month: current.getMonth() + 1,
    })
    current.setMonth(current.getMonth() + 1)
  }
  
  return months
}

export function parseMonthYear(monthYear: string): { year: number; month: number } | null {
  try {
    // Assumes format like "2024-01" or "2024-1"
    const [yearStr, monthStr] = monthYear.split('-')
    const year = parseInt(yearStr, 10)
    const month = parseInt(monthStr, 10)
    
    if (year && month >= 1 && month <= 12) {
      return { year, month }
    }
  } catch {
    // ignore
  }
  return null
}

export function getMonthYearString(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`
}
