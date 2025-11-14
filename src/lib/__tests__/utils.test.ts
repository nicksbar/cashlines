import { cn, getErrorMessage, handleApiError } from '../utils'

describe('Utility Functions', () => {
  describe('cn (className utilities)', () => {
    it('should merge Tailwind classes', () => {
      const result = cn('px-4 py-2', 'px-8')
      expect(result).toContain('py-2')
      expect(result).toContain('px-8') // px-8 should override px-4
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const result = cn('px-4', isActive && 'text-blue-500')
      expect(result).toContain('px-4')
      expect(result).toContain('text-blue-500')
    })

    it('should remove false values', () => {
      const result = cn('px-4', false && 'text-red-500', 'py-2')
      expect(result).toContain('px-4')
      expect(result).toContain('py-2')
      expect(result).not.toContain('text-red-500')
    })

    it('should handle undefined values', () => {
      const result = cn('px-4', undefined, 'py-2')
      expect(result).toContain('px-4')
      expect(result).toContain('py-2')
    })

    it('should merge conflicting Tailwind utilities', () => {
      // Last value should win (tailwind-merge behavior)
      const result = cn('bg-red-500', 'bg-blue-500')
      expect(result).toContain('bg-blue-500')
    })

    it('should handle arrays of classes', () => {
      const result = cn(['px-4', 'py-2'], 'text-lg')
      expect(result).toContain('px-4')
      expect(result).toContain('py-2')
      expect(result).toContain('text-lg')
    })
  })

  describe('getErrorMessage', () => {
    it('should extract message from Error instance', () => {
      const error = new Error('Something went wrong')
      const message = getErrorMessage(error)
      expect(message).toBe('Something went wrong')
    })

    it('should handle string errors', () => {
      const message = getErrorMessage('A string error')
      expect(message).toBe('A string error')
    })

    it('should handle unknown error types', () => {
      const message = getErrorMessage({ code: 500 })
      expect(message).toBe('An unknown error occurred')
    })

    it('should handle null', () => {
      const message = getErrorMessage(null)
      expect(message).toBe('An unknown error occurred')
    })

    it('should handle undefined', () => {
      const message = getErrorMessage(undefined)
      expect(message).toBe('An unknown error occurred')
    })

    it('should handle numbers', () => {
      const message = getErrorMessage(42)
      expect(message).toBe('An unknown error occurred')
    })

    it('should extract message from Error with custom message', () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message)
          this.name = 'CustomError'
        }
      }
      const error = new CustomError('Custom error message')
      const message = getErrorMessage(error)
      expect(message).toBe('Custom error message')
    })
  })

  describe('handleApiError', () => {
    it('should throw error from JSON response', async () => {
      const mockResponse = new Response(
        JSON.stringify({ error: 'API Error' }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      )

      await expect(handleApiError(mockResponse)).rejects.toThrow('API Error')
    })

    it('should use message field from JSON', async () => {
      const mockResponse = new Response(
        JSON.stringify({ message: 'Error from message field' }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      )

      await expect(handleApiError(mockResponse)).rejects.toThrow('Error from message field')
    })

    it('should fallback to HTTP status for JSON without error/message', async () => {
      const mockResponse = new Response(
        JSON.stringify({ data: 'something' }),
        { status: 500, headers: { 'content-type': 'application/json' } }
      )

      await expect(handleApiError(mockResponse)).rejects.toThrow('HTTP 500')
    })

    it('should handle plain text response', async () => {
      const mockResponse = new Response(
        'Plain text error message',
        { status: 400, headers: { 'content-type': 'text/plain' } }
      )

      await expect(handleApiError(mockResponse)).rejects.toThrow('Plain text error message')
    })

    it('should fallback to HTTP status for empty response', async () => {
      const mockResponse = new Response(
        '',
        { status: 403 }
      )

      await expect(handleApiError(mockResponse)).rejects.toThrow('HTTP 403')
    })

    it('should handle various content types', async () => {
      const mockResponse = new Response(
        'Error content',
        { status: 401, headers: { 'content-type': 'text/html' } }
      )

      await expect(handleApiError(mockResponse)).rejects.toThrow('Error content')
    })

    it('should never resolve (always throws)', async () => {
      const mockResponse = new Response(
        JSON.stringify({ error: 'Test error' }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      )

      let resolved = false
      try {
        await handleApiError(mockResponse)
        resolved = true
      } catch (e) {
        resolved = false
      }

      expect(resolved).toBe(false)
    })
  })
})
