import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}

/**
 * Handle API response errors
 */
export async function handleApiError(response: Response): Promise<never> {
  const contentType = response.headers.get('content-type')
  
  if (contentType?.includes('application/json')) {
    const data = await response.json()
    throw new Error(data.error || data.message || `HTTP ${response.status}`)
  }
  
  const text = await response.text()
  throw new Error(text || `HTTP ${response.status}`)
}

/**
 * Extract user-friendly error message from API response
 * Attempts to parse JSON error, falls back to text, provides sensible defaults
 */
export async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type')
    
    if (contentType?.includes('application/json')) {
      const data = await response.json()
      // API error responses should have 'error' or 'message' field
      if (data.error && typeof data.error === 'string') {
        return data.error
      }
      if (data.message && typeof data.message === 'string') {
        return data.message
      }
    }
    
    // Try to get text response
    const text = await response.text()
    if (text && text.length < 200) {
      return text
    }
  } catch (e) {
    // Silently fail if we can't parse response
  }
  
  // Provide sensible default based on status code
  const statusMessages: Record<number, string> = {
    400: 'Invalid request. Please check your input.',
    401: 'Authentication required. Please log in.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'This resource already exists. Please use a different name or check for duplicates.',
    422: 'Invalid data provided. Please check your input.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'Server error. Please try again later.',
    503: 'Service temporarily unavailable. Please try again later.',
  }
  
  return statusMessages[response.status] || `An error occurred (${response.status}). Please try again.`
}

