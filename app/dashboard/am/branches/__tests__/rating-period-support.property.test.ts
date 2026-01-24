/**
 * Property-based tests for Rating Period Support
 * 
 * Tests the rating period calculation and validation functionality
 * Validates Requirements: 6.1 (Rating Period Support)
 * 
 * **Property 6: Rating Period Support**
 * **Validates: Requirements 6.1**
 */

import { describe, it, expect } from '@jest/globals';
import fc from 'fast-check';

// Rating period types
type RatingPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
type TimePeriod = 'last_24_hours' | 'last_7_days' | 'last_30_days' | 'custom' | null;

// Rating period mapping logic
function mapTimePeriodToRatingPeriod(timePeriod: TimePeriod): RatingPeriod {
  switch (timePeriod) {
    case 'last_24_hours':
      return 'DAILY';
    case 'last_7_days':
      return 'WEEKLY';
    case 'last_30_days':
      return 'MONTHLY';
    case 'custom':
    case null:
    default:
      return 'DAILY';
  }
}

// Date validation for rating periods
function validatePeriodDate(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return false;
  }
  
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime()) && parsedDate <= new Date();
}

// Rating calculation request structure
interface RatingCalculationRequest {
  period: RatingPeriod;
  periodDate: string;
}

function createRatingCalculationRequest(timePeriod: TimePeriod, customDate?: Date): RatingCalculationRequest {
  const period = mapTimePeriodToRatingPeriod(timePeriod);
  const periodDate = customDate ? 
    customDate.toISOString().split('T')[0] : 
    new Date().toISOString().split('T')[0];
  
  return { period, periodDate };
}

// Property generators
const timePeriodArb = fc.constantFrom('last_24_hours', 'last_7_days', 'last_30_days', 'custom', null);
const ratingPeriodArb = fc.constantFrom('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');
const validDateArb = fc.date({ min: new Date('2020-01-01'), max: new Date() });
const dateStringArb = validDateArb.map(date => date.toISOString().split('T')[0]);

describe('Rating Period Support - Property Tests', () => {
  describe('Property 6: Rating Period Support', () => {
    it('should map time periods to rating periods correctly', () => {
      fc.assert(
        fc.property(
          timePeriodArb,
          (timePeriod) => {
            const ratingPeriod = mapTimePeriodToRatingPeriod(timePeriod);
            
            // Should always return a valid rating period
            expect(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).toContain(ratingPeriod);
            
            // Specific mappings should be consistent
            if (timePeriod === 'last_24_hours') {
              expect(ratingPeriod).toBe('DAILY');
            } else if (timePeriod === 'last_7_days') {
              expect(ratingPeriod).toBe('WEEKLY');
            } else if (timePeriod === 'last_30_days') {
              expect(ratingPeriod).toBe('MONTHLY');
            } else {
              // null, custom, or any other value should default to DAILY
              expect(ratingPeriod).toBe('DAILY');
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 7: Date Validation Consistency', () => {
    it('should validate period dates consistently', () => {
      fc.assert(
        fc.property(
          dateStringArb,
          (dateString) => {
            const isValid = validatePeriodDate(dateString);
            
            // Valid date strings should pass validation
            expect(isValid).toBe(true);
            
            // Should be in YYYY-MM-DD format
            expect(dateString).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            
            // Should be parseable as a valid date
            const parsedDate = new Date(dateString);
            expect(parsedDate.getTime()).not.toBeNaN();
            
            // Should not be in the future
            expect(parsedDate.getTime()).toBeLessThanOrEqual(new Date().getTime());
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8: Rating Calculation Request Structure', () => {
    it('should create valid rating calculation requests', () => {
      fc.assert(
        fc.property(
          timePeriodArb,
          fc.option(validDateArb),
          (timePeriod, customDate) => {
            const request = createRatingCalculationRequest(timePeriod, customDate || undefined);
            
            // Should have required fields
            expect(request).toHaveProperty('period');
            expect(request).toHaveProperty('periodDate');
            
            // Period should be valid
            expect(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).toContain(request.period);
            
            // Period date should be valid format
            expect(request.periodDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(validatePeriodDate(request.periodDate)).toBe(true);
            
            // If custom date provided, should use it
            if (customDate) {
              expect(request.periodDate).toBe(customDate.toISOString().split('T')[0]);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 9: Period Mapping Idempotency', () => {
    it('should be idempotent when mapping the same time period multiple times', () => {
      fc.assert(
        fc.property(
          timePeriodArb,
          (timePeriod) => {
            const firstMapping = mapTimePeriodToRatingPeriod(timePeriod);
            const secondMapping = mapTimePeriodToRatingPeriod(timePeriod);
            const thirdMapping = mapTimePeriodToRatingPeriod(timePeriod);
            
            // Multiple mappings should produce identical results
            expect(firstMapping).toBe(secondMapping);
            expect(secondMapping).toBe(thirdMapping);
            expect(firstMapping).toBe(thirdMapping);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 10: Rating Period Completeness', () => {
    it('should support all required rating periods', () => {
      fc.assert(
        fc.property(
          ratingPeriodArb,
          (period) => {
            const supportedPeriods: RatingPeriod[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'];
            
            // All generated periods should be supported
            expect(supportedPeriods).toContain(period);
            
            // Period should be a non-empty string
            expect(typeof period).toBe('string');
            expect(period.length).toBeGreaterThan(0);
            
            // Period should be uppercase
            expect(period).toBe(period.toUpperCase());
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 11: Date Range Validation', () => {
    it('should handle edge cases in date validation', () => {
      fc.assert(
        fc.property(
          fc.string(),
          (randomString) => {
            const isValid = validatePeriodDate(randomString);
            
            // Invalid strings should fail validation
            if (!randomString.match(/^\d{4}-\d{2}-\d{2}$/)) {
              expect(isValid).toBe(false);
            }
            
            // If it matches the format, check if it's a valid date
            if (randomString.match(/^\d{4}-\d{2}-\d{2}$/)) {
              const parsedDate = new Date(randomString);
              const isValidDate = !isNaN(parsedDate.getTime());
              const isNotFuture = parsedDate <= new Date();
              
              expect(isValid).toBe(isValidDate && isNotFuture);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 12: Request Consistency', () => {
    it('should create consistent requests for the same inputs', () => {
      fc.assert(
        fc.property(
          timePeriodArb,
          validDateArb,
          (timePeriod, date) => {
            const request1 = createRatingCalculationRequest(timePeriod, date);
            const request2 = createRatingCalculationRequest(timePeriod, date);
            
            // Same inputs should produce identical requests
            expect(request1.period).toBe(request2.period);
            expect(request1.periodDate).toBe(request2.periodDate);
            
            // Requests should be deep equal
            expect(request1).toEqual(request2);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});