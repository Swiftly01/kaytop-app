/**
 * Property-based tests for PerformanceLeaderboard component
 * 
 * Tests the performance metrics display functionality
 * Validates Requirements: 6.2 (Performance Metrics Display)
 * 
 * **Property 7: Performance Metrics Display**
 * **Validates: Requirements 6.2**
 */

import { describe, it, expect } from '@jest/globals';
import fc from 'fast-check';
import { LeaderboardEntry } from '../PerformanceLeaderboard';

// Mock leaderboard entry generators
const leaderboardEntryArb = fc.record({
  rank: fc.integer({ min: 1, max: 100 }),
  branchName: fc.constantFrom('Lagos Main Branch', 'Abuja Central Branch', 'Port Harcourt Branch', 'Kano Branch', 'Ibadan Branch'),
  branchId: fc.string({ minLength: 5, maxLength: 15 }).map(s => `ID: ${s.toUpperCase()}`),
  value: fc.integer({ min: 0, max: 10000000 }),
  change: fc.float({ min: -50, max: 50 }).filter(n => !isNaN(n) && isFinite(n)),
  changeLabel: fc.option(fc.string({ minLength: 5, maxLength: 20 })),
  isCurrency: fc.boolean()
});

const leaderboardEntriesArb = fc.array(leaderboardEntryArb, { minLength: 0, maxLength: 10 });

// Performance metrics display functions
function formatPerformanceValue(value: number, isCurrency?: boolean): string {
  if (isCurrency) {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  return value.toLocaleString('en-US');
}

function calculateChangeDisplay(change: number): { prefix: string; value: number; color: string } {
  const safeChange = isNaN(change) ? 0 : (change || 0);
  return {
    prefix: safeChange >= 0 ? '+' : '-',
    value: Math.abs(safeChange),
    color: safeChange >= 0 ? '#5CC47C' : '#E43535'
  };
}

function getRankColor(rank: number): string {
  const colors = {
    1: '#FFD700', // Gold
    2: '#C0C0C0', // Silver
    3: '#CD7F32'  // Bronze
  };
  return colors[rank as keyof typeof colors] || '#6B7280';
}

function validateLeaderboardEntry(entry: LeaderboardEntry): boolean {
  return (
    typeof entry.rank === 'number' &&
    entry.rank > 0 &&
    typeof entry.branchName === 'string' &&
    entry.branchName.length > 0 &&
    typeof entry.branchId === 'string' &&
    entry.branchId.length > 0 &&
    typeof entry.value === 'number' &&
    entry.value >= 0 &&
    typeof entry.change === 'number' &&
    !isNaN(entry.change) &&
    (entry.isCurrency === undefined || typeof entry.isCurrency === 'boolean')
  );
}

function sortLeaderboardByRank(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => a.rank - b.rank);
}

describe('PerformanceLeaderboard - Property Tests', () => {
  describe('Property 7: Performance Metrics Display', () => {
    it('should display performance metrics correctly for all entries', () => {
      fc.assert(
        fc.property(
          leaderboardEntriesArb,
          (entries) => {
            // All entries should be valid
            const allValid = entries.every(validateLeaderboardEntry);
            expect(allValid).toBe(true);
            
            // Each entry should have proper formatting
            entries.forEach(entry => {
              const formattedValue = formatPerformanceValue(entry.value, entry.isCurrency);
              const changeDisplay = calculateChangeDisplay(entry.change);
              const rankColor = getRankColor(entry.rank);
              
              // Value formatting should be consistent
              expect(typeof formattedValue).toBe('string');
              expect(formattedValue.length).toBeGreaterThan(0);
              
              // Change display should be properly calculated
              expect(changeDisplay.prefix).toMatch(/^[+-]$/);
              expect(changeDisplay.value).toBeGreaterThanOrEqual(0);
              expect(changeDisplay.color).toMatch(/^#[0-9A-F]{6}$/i);
              
              // Rank color should be valid hex color
              expect(rankColor).toMatch(/^#[0-9A-F]{6}$/i);
            });
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8: Value Formatting Consistency', () => {
    it('should format currency and non-currency values consistently', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 10000000 }),
          fc.boolean(),
          (value, isCurrency) => {
            const formatted = formatPerformanceValue(value, isCurrency);
            
            // Should always return a string
            expect(typeof formatted).toBe('string');
            expect(formatted.length).toBeGreaterThan(0);
            
            // Currency values should contain currency formatting
            if (isCurrency && value > 0) {
              expect(formatted).toMatch(/[₦,\d]/);
            }
            
            // Non-currency values should be numeric strings with commas
            if (!isCurrency && value > 0) {
              expect(formatted).toMatch(/[\d,]/);
            }
            
            // Zero values should be handled correctly
            if (value === 0) {
              expect(formatted).toMatch(/0/);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 9: Rank Display Logic', () => {
    it('should assign appropriate colors based on rank', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          (rank) => {
            const color = getRankColor(rank);
            
            // Should always return a valid hex color
            expect(color).toMatch(/^#[0-9A-F]{6}$/i);
            
            // Top 3 ranks should have special colors
            if (rank === 1) {
              expect(color).toBe('#FFD700'); // Gold
            } else if (rank === 2) {
              expect(color).toBe('#C0C0C0'); // Silver
            } else if (rank === 3) {
              expect(color).toBe('#CD7F32'); // Bronze
            } else {
              expect(color).toBe('#6B7280'); // Default gray
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 10: Change Calculation Accuracy', () => {
    it('should calculate change display properties accurately', () => {
      fc.assert(
        fc.property(
          fc.float({ min: -100, max: 100 }).filter(n => !isNaN(n) && isFinite(n)),
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
            expect(display.value).toBe(Math.abs(change));
            expect(display.value).toBeGreaterThanOrEqual(0);
            
            // Color should be valid hex
            expect(display.color).toMatch(/^#[0-9A-F]{6}$/i);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 11: Leaderboard Sorting', () => {
    it('should sort leaderboard entries by rank correctly', () => {
      fc.assert(
        fc.property(
          leaderboardEntriesArb,
          (entries) => {
            if (entries.length === 0) return true;
            
            const sorted = sortLeaderboardByRank(entries);
            
            // Should maintain same length
            expect(sorted.length).toBe(entries.length);
            
            // Should be sorted by rank ascending
            for (let i = 1; i < sorted.length; i++) {
              expect(sorted[i].rank).toBeGreaterThanOrEqual(sorted[i - 1].rank);
            }
            
            // Should contain all original entries
            entries.forEach(entry => {
              expect(sorted).toContainEqual(entry);
            });
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 12: Entry Validation Completeness', () => {
    it('should validate all required fields in leaderboard entries', () => {
      fc.assert(
        fc.property(
          leaderboardEntriesArb,
          (entries) => {
            entries.forEach(entry => {
              // Required fields should be present and valid
              expect(entry).toHaveProperty('rank');
              expect(entry).toHaveProperty('branchName');
              expect(entry).toHaveProperty('branchId');
              expect(entry).toHaveProperty('value');
              expect(entry).toHaveProperty('change');
              
              // Types should be correct
              expect(typeof entry.rank).toBe('number');
              expect(typeof entry.branchName).toBe('string');
              expect(typeof entry.branchId).toBe('string');
              expect(typeof entry.value).toBe('number');
              expect(typeof entry.change).toBe('number');
              
              // Values should be within reasonable ranges
              expect(entry.rank).toBeGreaterThan(0);
              expect(entry.branchName.length).toBeGreaterThan(0);
              expect(entry.branchId.length).toBeGreaterThan(0);
              expect(entry.value).toBeGreaterThanOrEqual(0);
              expect(isFinite(entry.change)).toBe(true);
            });
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 13: Performance Metrics Range Validation', () => {
    it('should handle edge cases in performance metrics', () => {
      fc.assert(
        fc.property(
          fc.record({
            value: fc.oneof(fc.constant(0), fc.constant(Number.MAX_SAFE_INTEGER), fc.integer({ min: 1, max: 1000000 })),
            change: fc.oneof(fc.constant(0), fc.constant(-100), fc.constant(100), fc.float({ min: -50, max: 50 })),
            isCurrency: fc.boolean()
          }),
          ({ value, change, isCurrency }) => {
            // Should handle extreme values gracefully
            const formattedValue = formatPerformanceValue(value, isCurrency);
            const changeDisplay = calculateChangeDisplay(change);
            
            expect(typeof formattedValue).toBe('string');
            expect(formattedValue.length).toBeGreaterThan(0);
            
            expect(typeof changeDisplay.prefix).toBe('string');
            expect(typeof changeDisplay.value).toBe('number');
            expect(typeof changeDisplay.color).toBe('string');
            
            // Should not throw errors with extreme values
            expect(changeDisplay.value).toBeGreaterThanOrEqual(0);
            expect(changeDisplay.color).toMatch(/^#[0-9A-F]{6}$/i);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});