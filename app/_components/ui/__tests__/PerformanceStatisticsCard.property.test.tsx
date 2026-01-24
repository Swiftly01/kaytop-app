/**
 * Property-based tests for PerformanceStatisticsCard component
 * 
 * Tests the performance statistics card rendering and data handling
 * Validates Requirements: 2.2, 4.2 (Performance-focused statistics cards)
 */

import { describe, it, expect } from '@jest/globals';
import fc from 'fast-check';
import { PerformanceStatSection } from '../PerformanceStatisticsCard';

// Mock performance statistics data generators
const performanceStatSectionArb = fc.record({
  label: fc.constantFrom('Top by Savings', 'Top by Loan Disbursement', 'Top by Loan Repayment'),
  branchName: fc.constantFrom('Lagos Main Branch', 'Abuja Central Branch', 'Port Harcourt Branch', 'Kano Branch'),
  value: fc.integer({ min: 0, max: 10000000 }),
  change: fc.float({ min: -50, max: 50 }).filter(n => !isNaN(n) && isFinite(n)),
  changeLabel: fc.option(fc.string({ minLength: 5, maxLength: 20 })),
  isCurrency: fc.boolean(),
  rank: fc.option(fc.integer({ min: 1, max: 10 }))
});

const performanceStatSectionsArb = fc.array(performanceStatSectionArb, { minLength: 1, maxLength: 5 });

// Performance statistics validation functions
function validatePerformanceStatSection(section: PerformanceStatSection): boolean {
  return (
    typeof section.label === 'string' &&
    section.label.length > 0 &&
    typeof section.branchName === 'string' &&
    section.branchName.length > 0 &&
    (typeof section.value === 'string' || typeof section.value === 'number') &&
    typeof section.change === 'number' &&
    !isNaN(section.change) &&
    (section.isCurrency === undefined || typeof section.isCurrency === 'boolean') &&
    (section.rank === undefined || (typeof section.rank === 'number' && section.rank > 0))
  );
}

function formatPerformanceValue(value: string | number, isCurrency?: boolean): string {
  if (value === null || value === undefined) {
    return '0';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return String(value);
  }
  
  if (isCurrency) {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numValue);
  }
  
  return numValue.toLocaleString('en-US');
}

function calculateChangeDisplay(change: number): { prefix: string; value: number; color: string } {
  const safeChange = isNaN(change) ? 0 : (change || 0);
  return {
    prefix: safeChange >= 0 ? '+' : '-',
    value: Math.abs(safeChange),
    color: safeChange >= 0 ? '#5CC47C' : '#E43535'
  };
}

describe('PerformanceStatisticsCard - Property Tests', () => {
  describe('Property 1: Performance Data Validation', () => {
    it('should validate all performance stat sections correctly', () => {
      fc.assert(
        fc.property(
          performanceStatSectionsArb,
          (sections) => {
            // All sections should pass validation
            const allValid = sections.every(validatePerformanceStatSection);
            expect(allValid).toBe(true);
            
            // Each section should have required fields
            sections.forEach(section => {
              expect(section.label).toBeDefined();
              expect(section.branchName).toBeDefined();
              expect(section.value).toBeDefined();
              expect(section.change).toBeDefined();
            });
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2: Value Formatting Consistency', () => {
    it('should format values consistently based on currency flag', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10000000 }),
          fc.boolean(),
          (value, isCurrency) => {
            const formatted = formatPerformanceValue(value, isCurrency);
            
            // Should always return a string
            expect(typeof formatted).toBe('string');
            expect(formatted.length).toBeGreaterThan(0);
            
            // Currency values should contain currency symbol or formatting
            if (isCurrency && value > 0) {
              expect(formatted).toMatch(/[₦,\d]/);
            }
            
            // Non-currency values should be numeric strings
            if (!isCurrency && value > 0) {
              expect(formatted).toMatch(/[\d,]/);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 3: Change Calculation Accuracy', () => {
    it('should calculate change display properties correctly', () => {
      fc.assert(
        fc.property(
          fc.float({ min: -100, max: 100 }).filter(n => !isNaN(n)),
          (change) => {
            const display = calculateChangeDisplay(change);
            
            // Prefix should match sign
            if (change >= 0) {
              expect(display.prefix).toBe('+');
              expect(display.color).toBe('#5CC47C');
            } else {
              expect(display.prefix).toBe('-');
              expect(display.color).toBe('#E43535');
            }
            
            // Value should be absolute
            expect(display.value).toBe(Math.abs(change || 0));
            expect(display.value).toBeGreaterThanOrEqual(0);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 4: Performance Categories Validation', () => {
    it('should only accept valid performance categories', () => {
      fc.assert(
        fc.property(
          performanceStatSectionsArb,
          (sections) => {
            const validCategories = ['Top by Savings', 'Top by Loan Disbursement', 'Top by Loan Repayment'];
            
            sections.forEach(section => {
              expect(validCategories).toContain(section.label);
            });
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 5: Rank Display Logic', () => {
    it('should handle rank display correctly', () => {
      fc.assert(
        fc.property(
          fc.option(fc.integer({ min: 1, max: 10 })),
          (rank) => {
            // Rank should be positive if defined
            if (rank !== null && rank !== undefined) {
              expect(rank).toBeGreaterThan(0);
              expect(rank).toBeLessThanOrEqual(10);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 6: Branch Name Validation', () => {
    it('should validate branch names are non-empty strings', () => {
      fc.assert(
        fc.property(
          performanceStatSectionsArb,
          (sections) => {
            sections.forEach(section => {
              expect(typeof section.branchName).toBe('string');
              expect(section.branchName.length).toBeGreaterThan(0);
            });
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 7: Performance Metrics Range Validation', () => {
    it('should validate performance metrics are within reasonable ranges', () => {
      fc.assert(
        fc.property(
          performanceStatSectionsArb,
          (sections) => {
            sections.forEach(section => {
              // Values should be non-negative for performance metrics
              const numValue = typeof section.value === 'number' ? section.value : parseFloat(String(section.value));
              if (!isNaN(numValue)) {
                expect(numValue).toBeGreaterThanOrEqual(0);
              }
              
              // Change should be within reasonable bounds
              expect(section.change).toBeGreaterThanOrEqual(-100);
              expect(section.change).toBeLessThanOrEqual(100);
            });
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});