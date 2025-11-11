import {
  calculateSBNL,
  formatSBNLDescription,
  analyzeSBNLTrend,
  generateSBNLInsights,
} from '../sbnl'

describe('SBNL (Spent But Not Listed) Utilities', () => {
  describe('calculateSBNL', () => {
    it('should calculate SBNL correctly', () => {
      const result = calculateSBNL(1850, 1200)
      expect(result.spentButNotListed).toBe(650)
      expect(result.percentage).toBe(35)
    })

    it('should handle zero tracked expenses', () => {
      const result = calculateSBNL(1000, 0)
      expect(result.spentButNotListed).toBe(1000)
      expect(result.percentage).toBe(100)
    })

    it('should handle negative SBNL (tracked more than payment)', () => {
      const result = calculateSBNL(1000, 1200)
      expect(result.spentButNotListed).toBe(-200)
      expect(result.percentage).toBe(-20)
    })

    it('should handle zero payment', () => {
      const result = calculateSBNL(0, 500)
      expect(result.spentButNotListed).toBe(-500)
      expect(result.percentage).toBe(0)
    })

    it('should round percentage correctly', () => {
      const result = calculateSBNL(1000, 333)
      expect(result.spentButNotListed).toBe(667)
      expect(result.percentage).toBe(67) // (667 / 1000) * 100 = 66.7, rounded to 67
    })

    it('should handle small SBNL amounts', () => {
      const result = calculateSBNL(2000, 1995)
      expect(result.spentButNotListed).toBe(5)
      expect(result.percentage).toBe(0) // (5 / 2000) * 100 = 0.25, rounds to 0
    })

    it('should handle decimal amounts', () => {
      const result = calculateSBNL(1850.50, 1200.25)
      expect(result.spentButNotListed).toBeCloseTo(650.25, 2)
      expect(result.percentage).toBe(35)
    })
  })

  describe('formatSBNLDescription', () => {
    it('should indicate all spending accounted for (negative SBNL)', () => {
      const description = formatSBNLDescription(-100, -10, 1000)
      expect(description).toContain('All CC spending accounted for')
      expect(description).toContain('$100.00')
    })

    it('should praise excellent tracking (< 5%)', () => {
      const description = formatSBNLDescription(50, 2, 2500)
      expect(description).toContain('Great tracking!')
      expect(description).toContain('$50.00')
    })

    it('should indicate good tracking (5-15%)', () => {
      const description = formatSBNLDescription(150, 10, 1500)
      expect(description).toContain('Good tracking')
      expect(description).toContain('$150.00')
    })

    it('should suggest review for moderate gaps (15-25%)', () => {
      const description = formatSBNLDescription(300, 20, 1500)
      expect(description).toContain('might want to review')
      expect(description).toContain('$300.00')
    })

    it('should warn about significant gaps (> 25%)', () => {
      const description = formatSBNLDescription(500, 35, 1400)
      expect(description).toContain('Significant untracked spending')
      expect(description).toContain('⚠️')
      expect(description).toContain('$500.00')
    })

    it('should handle zero SBNL', () => {
      const description = formatSBNLDescription(0, 0, 1000)
      expect(description).toContain('All CC spending accounted for')
    })
  })

  describe('analyzeSBNLTrend', () => {
    it('should return insufficient data with empty array', () => {
      const result = analyzeSBNLTrend([])
      expect(result.average).toBe(0)
      expect(result.trend).toBe('insufficient_data')
      expect(result.highest).toBeNull()
      expect(result.lowest).toBeNull()
    })

    it('should calculate average correctly', () => {
      const data = [
        { month: 9, year: 2024, sbnl: 300, payment: 2000 },
        { month: 10, year: 2024, sbnl: 400, payment: 2000 },
        { month: 11, year: 2024, sbnl: 500, payment: 2000 },
      ]
      const result = analyzeSBNLTrend(data)
      expect(result.average).toBe(400)
    })

    it('should identify increasing trend', () => {
      const data = [
        { month: 9, year: 2024, sbnl: 200, payment: 2000 },
        { month: 10, year: 2024, sbnl: 250, payment: 2000 },
        { month: 11, year: 2024, sbnl: 300, payment: 2000 },
        { month: 12, year: 2024, sbnl: 400, payment: 2000 },
        { month: 1, year: 2025, sbnl: 450, payment: 2000 },
      ]
      const result = analyzeSBNLTrend(data)
      expect(result.trend).toBe('increasing')
    })

    it('should identify decreasing trend', () => {
      const data = [
        { month: 9, year: 2024, sbnl: 500, payment: 2000 },
        { month: 10, year: 2024, sbnl: 450, payment: 2000 },
        { month: 11, year: 2024, sbnl: 400, payment: 2000 },
        { month: 12, year: 2024, sbnl: 300, payment: 2000 },
        { month: 1, year: 2025, sbnl: 250, payment: 2000 },
      ]
      const result = analyzeSBNLTrend(data)
      expect(result.trend).toBe('decreasing')
    })

    it('should identify stable trend', () => {
      const data = [
        { month: 9, year: 2024, sbnl: 300, payment: 2000 },
        { month: 10, year: 2024, sbnl: 310, payment: 2000 },
        { month: 11, year: 2024, sbnl: 305, payment: 2000 },
      ]
      const result = analyzeSBNLTrend(data)
      expect(result.trend).toBe('stable')
    })

    it('should track highest and lowest values', () => {
      const data = [
        { month: 9, year: 2024, sbnl: 200, payment: 2000 },
        { month: 10, year: 2024, sbnl: 500, payment: 2000 },
        { month: 11, year: 2024, sbnl: 350, payment: 2000 },
      ]
      const result = analyzeSBNLTrend(data)
      expect(result.highest).toBe(500)
      expect(result.lowest).toBe(200)
      expect(result.volatility).toBe(300)
    })

    it('should handle single data point (stable)', () => {
      const data = [{ month: 11, year: 2024, sbnl: 300, payment: 2000 }]
      const result = analyzeSBNLTrend(data)
      expect(result.average).toBe(300)
      expect(result.trend).toBe('stable')
    })
  })

  describe('generateSBNLInsights', () => {
    it('should warn about high SBNL (> 25%)', () => {
      const insights = generateSBNLInsights(600, 30, 2000)
      expect(insights).toContainEqual(
        expect.objectContaining({
          severity: 'high',
          message: expect.stringContaining('25%'),
        })
      )
    })

    it('should advise on moderate SBNL (> 20%)', () => {
      const insights = generateSBNLInsights(400, 22, 1800)
      expect(insights).toContainEqual(
        expect.objectContaining({
          severity: 'medium',
          message: expect.stringContaining('22%'),
        })
      )
    })

    it('should praise excellent tracking (small SBNL)', () => {
      const insights = generateSBNLInsights(5, 0.5, 1000)
      expect(insights).toContainEqual(
        expect.objectContaining({
          severity: 'low',
          message: expect.stringContaining('Excellent tracking'),
        })
      )
    })

    it('should warn about increasing trend', () => {
      const insights = generateSBNLInsights(500, 25, 2000, 'increasing')
      expect(insights).toContainEqual(
        expect.objectContaining({
          severity: 'medium',
          message: expect.stringContaining('trending upward'),
        })
      )
    })

    it('should not warn about decreasing trend', () => {
      const insights = generateSBNLInsights(300, 20, 1500, 'decreasing')
      const decreasingInsights = insights.filter((i: { message: string }) => i.message.includes('decreasing'))
      expect(decreasingInsights).toHaveLength(0)
    })

    it('should handle multiple insights', () => {
      const insights = generateSBNLInsights(600, 35, 1700, 'increasing')
      expect(insights.length).toBeGreaterThanOrEqual(2)
    })

    it('should handle no insights (perfect tracking)', () => {
      const insights = generateSBNLInsights(0, 0, 1000)
      expect(insights.length).toBe(0)
    })
  })

  describe('Integration scenarios', () => {
    it('should handle typical user scenario', () => {
      // November: tracked $1200, paid $1850 in December
      const sbnl = calculateSBNL(1850, 1200)
      const description = formatSBNLDescription(sbnl.spentButNotListed, sbnl.percentage, 1850)
      const insights = generateSBNLInsights(sbnl.spentButNotListed, sbnl.percentage, 1850)

      expect(sbnl.spentButNotListed).toBe(650)
      expect(sbnl.percentage).toBe(35)
      expect(description).toContain('Significant untracked')
      expect(insights.length).toBeGreaterThan(0)
    })

    it('should handle month-to-month comparison', () => {
      const months = [
        { month: 9, year: 2024, sbnl: 300, payment: 2000 },
        { month: 10, year: 2024, sbnl: 350, payment: 2000 },
        { month: 11, year: 2024, sbnl: 650, payment: 1850 },
        { month: 12, year: 2024, sbnl: 700, payment: 1800 },
        { month: 1, year: 2025, sbnl: 750, payment: 1750 },
      ]

      const trend = analyzeSBNLTrend(months)
      expect(trend.average).toBeCloseTo(550, 0)
      expect(trend.highest).toBe(750)
      expect(trend.trend).toBe('increasing')
    })

    it('should identify improvement over time', () => {
      const months = [
        { month: 9, year: 2024, sbnl: 600, payment: 2000 },
        { month: 10, year: 2024, sbnl: 400, payment: 2000 },
        { month: 11, year: 2024, sbnl: 200, payment: 2000 },
        { month: 12, year: 2024, sbnl: 150, payment: 2000 },
        { month: 1, year: 2025, sbnl: 100, payment: 2000 },
      ]

      const trend = analyzeSBNLTrend(months)
      // With 5 months, it compares first 3 (avg: 400) vs last 3 (avg: 150) = decreasing
      expect(trend.trend).toBe('decreasing')
      
      // For excellent tracking, we need SBNL to be small (< 5%)
      const insight = generateSBNLInsights(5, 0.25, 2000, trend.trend)
      expect(insight).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('Excellent'),
        })
      )
    })
  })
})
