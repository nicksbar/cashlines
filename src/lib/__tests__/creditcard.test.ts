import {
  calculateCCUtilization,
  formatCCUtilizationDescription,
  analyzeCCTrend,
  generateCCInsights,
  CCUtilization,
  CCHealthTrend,
} from '../creditcard'

describe('Credit Card Utilities', () => {
  describe('calculateCCUtilization', () => {
    it('should calculate healthy utilization (<30%)', () => {
      const result = calculateCCUtilization(1500, 5000)
      expect(result.utilizationPercent).toBe(30)
      expect(result.status).toBe('healthy')
      expect(result.availableCredit).toBe(3500)
    })

    it('should calculate warning utilization (30-70%)', () => {
      const result = calculateCCUtilization(3000, 5000)
      expect(result.utilizationPercent).toBe(60)
      expect(result.status).toBe('warning')
      expect(result.availableCredit).toBe(2000)
    })

    it('should calculate danger utilization (>70%)', () => {
      const result = calculateCCUtilization(4000, 5000)
      expect(result.utilizationPercent).toBe(80)
      expect(result.status).toBe('danger')
      expect(result.availableCredit).toBe(1000)
    })

    it('should handle zero balance', () => {
      const result = calculateCCUtilization(0, 5000)
      expect(result.utilizationPercent).toBe(0)
      expect(result.status).toBe('healthy')
      expect(result.availableCredit).toBe(5000)
    })

    it('should handle maxed out card', () => {
      const result = calculateCCUtilization(5000, 5000)
      expect(result.utilizationPercent).toBe(100)
      expect(result.status).toBe('danger')
      expect(result.availableCredit).toBe(0)
    })

    it('should handle no credit limit', () => {
      const result = calculateCCUtilization(1500, 0)
      expect(result.utilizationPercent).toBe(0)
      expect(result.status).toBe('healthy')
      expect(result.statusMessage).toBe('No credit limit set')
    })

    it('should handle negative credit limit gracefully', () => {
      const result = calculateCCUtilization(1500, -5000)
      expect(result.status).toBe('healthy')
    })

    it('should round utilization percentage', () => {
      const result = calculateCCUtilization(1234.56, 5000)
      expect(result.utilizationPercent).toBe(25) // 24.69% rounds to 25
    })

    it('should calculate available credit correctly with decimal amounts', () => {
      const result = calculateCCUtilization(1234.56, 5000.99)
      expect(result.availableCredit).toBeCloseTo(3766.43, 1)
    })
  })

  describe('formatCCUtilizationDescription', () => {
    it('should format healthy utilization message', () => {
      const utilization = calculateCCUtilization(1500, 5000)
      const description = formatCCUtilizationDescription(utilization)
      expect(description).toContain('30%')
      expect(description).toContain('$1500.00')
      expect(description).toContain('$5000.00')
      expect(description).toContain('Keep it up')
    })

    it('should format warning utilization message', () => {
      const utilization = calculateCCUtilization(3000, 5000)
      const description = formatCCUtilizationDescription(utilization)
      expect(description).toContain('60%')
      expect(description).toContain('paying down')
    })

    it('should format danger utilization message', () => {
      const utilization = calculateCCUtilization(4000, 5000)
      const description = formatCCUtilizationDescription(utilization)
      expect(description).toContain('80%')
      expect(description).toContain('ASAP')
    })

    it('should handle no credit limit set', () => {
      const utilization = calculateCCUtilization(1500, 0)
      const description = formatCCUtilizationDescription(utilization)
      expect(description).toBe('No credit limit set')
    })

    it('should include available credit in message', () => {
      const utilization = calculateCCUtilization(1500, 5000)
      const description = formatCCUtilizationDescription(utilization)
      expect(description).toContain('Available: $3500.00')
    })
  })

  describe('analyzeCCTrend', () => {
    it('should detect improving trend (decreasing utilization)', () => {
      const data = [
        { month: 'Sep', utilized: 4000, limit: 5000 },
        { month: 'Oct', utilized: 3500, limit: 5000 },
        { month: 'Nov', utilized: 2500, limit: 5000 },
      ]
      const result = analyzeCCTrend(data)
      expect(result.trend).toBe('improving')
      expect(result.averageUtilization).toBe(67) // (80+70+50)/3 = 66.67 rounds to 67
    })

    it('should detect worsening trend (increasing utilization)', () => {
      const data = [
        { month: 'Sep', utilized: 2500, limit: 5000 },
        { month: 'Oct', utilized: 3500, limit: 5000 },
        { month: 'Nov', utilized: 4000, limit: 5000 },
      ]
      const result = analyzeCCTrend(data)
      expect(result.trend).toBe('worsening')
    })

    it('should detect stable trend', () => {
      const data = [
        { month: 'Sep', utilized: 3000, limit: 5000 },
        { month: 'Oct', utilized: 3000, limit: 5000 },
        { month: 'Nov', utilized: 3100, limit: 5000 },
      ]
      const result = analyzeCCTrend(data)
      expect(result.trend).toBe('stable')
    })

    it('should calculate average utilization across all months', () => {
      const data = [
        { month: 'Sep', utilized: 2500, limit: 5000 }, // 50%
        { month: 'Oct', utilized: 3000, limit: 5000 }, // 60%
        { month: 'Nov', utilized: 4000, limit: 5000 }, // 80%
      ]
      const result = analyzeCCTrend(data)
      expect(result.averageUtilization).toBe(63) // (50+60+80)/3 = 63.33 rounds to 63
    })

    it('should handle single month of data', () => {
      const data = [{ month: 'Nov', utilized: 3000, limit: 5000 }]
      const result = analyzeCCTrend(data)
      expect(result.trend).toBe('stable')
      expect(result.averageUtilization).toBe(60)
    })

    it('should handle zero limit', () => {
      const data = [{ month: 'Nov', utilized: 1000, limit: 0 }]
      const result = analyzeCCTrend(data)
      expect(result.monthData[0].percent).toBe(0)
    })

    it('should handle empty data', () => {
      const result = analyzeCCTrend([])
      expect(result.monthData).toEqual([])
      expect(result.trend).toBe('stable')
      expect(result.averageUtilization).toBe(0)
    })

    it('should map month data correctly', () => {
      const data = [
        { month: 'Sep', utilized: 2500, limit: 5000 },
        { month: 'Oct', utilized: 3000, limit: 5000 },
      ]
      const result = analyzeCCTrend(data)
      expect(result.monthData.length).toBe(2)
      expect(result.monthData[0].month).toBe('Sep')
      expect(result.monthData[0].percent).toBe(50)
    })
  })

  describe('generateCCInsights', () => {
    it('should provide healthy utilization insights', () => {
      const utilization = calculateCCUtilization(1500, 5000)
      const insights = generateCCInsights(utilization)
      expect(insights.length).toBeGreaterThan(0)
      expect(insights.some(i => i.includes('<30%'))).toBe(true)
      expect(insights.some(i => i.includes('✅'))).toBe(true)
    })

    it('should provide warning utilization insights', () => {
      const utilization = calculateCCUtilization(3000, 5000)
      const insights = generateCCInsights(utilization)
      expect(insights.length).toBeGreaterThan(0)
      expect(insights.some(i => i.includes('moderate'))).toBe(true)
      expect(insights.some(i => i.includes('📊'))).toBe(true)
    })

    it('should provide danger utilization insights', () => {
      const utilization = calculateCCUtilization(4000, 5000)
      const insights = generateCCInsights(utilization)
      expect(insights.length).toBeGreaterThan(0)
      expect(insights.some(i => i.includes('URGENT'))).toBe(true)
      expect(insights.some(i => i.includes('⚠️'))).toBe(true)
    })

    it('should alert when available credit is very low', () => {
      const utilization = calculateCCUtilization(4950, 5000)
      const insights = generateCCInsights(utilization)
      expect(insights.some(i => i.includes('$50.00'))).toBe(true)
    })

    it('should suggest setting credit limit when not set', () => {
      const utilization = calculateCCUtilization(1500, 0)
      const insights = generateCCInsights(utilization)
      expect(insights.some(i => i.includes('Set your credit limit'))).toBe(true)
    })

    it('should include trend insights when provided', () => {
      const utilization = calculateCCUtilization(3000, 5000)
      const trend: CCHealthTrend = {
        monthData: [],
        trend: 'improving',
        averageUtilization: 60,
      }
      const insights = generateCCInsights(utilization, trend)
      expect(insights.some(i => i.includes('trending downward'))).toBe(true)
      expect(insights.some(i => i.includes('🎯'))).toBe(true)
    })

    it('should warn about worsening trend', () => {
      const utilization = calculateCCUtilization(3000, 5000)
      const trend: CCHealthTrend = {
        monthData: [],
        trend: 'worsening',
        averageUtilization: 60,
      }
      const insights = generateCCInsights(utilization, trend)
      expect(insights.some(i => i.includes('Trend Alert'))).toBe(true)
      expect(insights.some(i => i.includes('📈'))).toBe(true)
    })
  })
})
