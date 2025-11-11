import { personCreateSchema, personUpdateSchema } from '../../../lib/validation'

describe('Person Validation Schemas', () => {
  describe('personCreateSchema', () => {
    it('should accept valid person data', () => {
      const valid = {
        name: 'Alice',
        role: 'primary',
        color: '#FF5733',
      }
      expect(() => personCreateSchema.parse(valid)).not.toThrow()
    })

    it('should require a name', () => {
      const invalid = {
        role: 'spouse',
        color: '#FF5733',
      }
      expect(() => personCreateSchema.parse(invalid)).toThrow()
    })

    it('should accept optional role', () => {
      const valid = {
        name: 'Bob',
      }
      expect(() => personCreateSchema.parse(valid)).not.toThrow()
    })

    it('should accept optional color', () => {
      const valid = {
        name: 'Charlie',
        role: 'spouse',
      }
      expect(() => personCreateSchema.parse(valid)).not.toThrow()
    })

    it('should reject invalid hex color', () => {
      const invalid = {
        name: 'Diana',
        color: 'invalid-color',
      }
      expect(() => personCreateSchema.parse(invalid)).toThrow()
    })

    it('should accept valid hex colors', () => {
      const validColors = ['#FF5733', '#4ECDC4', '#45B7D1', '#000000', '#FFFFFF']
      validColors.forEach((color) => {
        expect(() => personCreateSchema.parse({ name: 'Test', color })).not.toThrow()
      })
    })

    it('should reject invalid hex format', () => {
      const invalidColors = ['#FF57', '#FF57330', '#GG5733', 'FF5733']
      invalidColors.forEach((color) => {
        expect(() => personCreateSchema.parse({ name: 'Test', color })).toThrow()
      })
    })
  })

  describe('personUpdateSchema', () => {
    it('should accept all fields optional', () => {
      const valid = {}
      expect(() => personUpdateSchema.parse(valid)).not.toThrow()
    })

    it('should allow updating name only', () => {
      const valid = { name: 'Eve' }
      expect(() => personUpdateSchema.parse(valid)).not.toThrow()
    })

    it('should allow updating role only', () => {
      const valid = { role: 'child' }
      expect(() => personUpdateSchema.parse(valid)).not.toThrow()
    })

    it('should allow updating color only', () => {
      const valid = { color: '#FF5733' }
      expect(() => personUpdateSchema.parse(valid)).not.toThrow()
    })

    it('should allow nullifying color', () => {
      const valid = { color: null }
      expect(() => personUpdateSchema.parse(valid)).not.toThrow()
    })

    it('should allow partial updates', () => {
      const valid = { name: 'Frank', color: '#45B7D1' }
      expect(() => personUpdateSchema.parse(valid)).not.toThrow()
    })

    it('should reject invalid hex color on update', () => {
      const invalid = { color: 'bad-color' }
      expect(() => personUpdateSchema.parse(invalid)).toThrow()
    })

    it('should require non-empty name if provided', () => {
      const invalid = { name: '' }
      expect(() => personUpdateSchema.parse(invalid)).toThrow()
    })
  })

  describe('Person roles', () => {
    const validRoles = ['primary', 'spouse', 'child', 'dependent', 'other']

    it('should accept valid roles', () => {
      validRoles.forEach((role) => {
        const valid = { name: 'Test', role }
        expect(() => personCreateSchema.parse(valid)).not.toThrow()
      })
    })

    it('should accept custom role strings', () => {
      const valid = { name: 'Test', role: 'custom-role' }
      expect(() => personCreateSchema.parse(valid)).not.toThrow()
    })
  })
})
