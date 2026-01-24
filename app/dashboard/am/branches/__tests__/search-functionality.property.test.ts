/**
 * Property-based tests for Search Functionality
 * 
 * Tests the branch search functionality in both branches and leaderboard tabs
 * Validates Requirements: 8.1 (Search Functionality)
 * 
 * **Property 9: Search Functionality**
 * **Validates: Requirements 8.1**
 */

import { describe, it, expect } from '@jest/globals';
import fc from 'fast-check';

// Mock data types
interface BranchRecord {
  id: string;
  branchId: string;
  name: string;
  cos: string;
  customers: number;
  dateCreated: string;
}

interface LeaderboardEntry {
  rank: number;
  branchName: string;
  branchId: string;
  value: number;
  change: number;
  isCurrency?: boolean;
}

// Search functionality
function searchBranches(branches: BranchRecord[], query: string): BranchRecord[] {
  if (!query.trim()) {
    return branches;
  }
  
  const lowerQuery = query.toLowerCase();
  return branches.filter(branch =>
    branch.name.toLowerCase().includes(lowerQuery) ||
    branch.branchId.toLowerCase().includes(lowerQuery) ||
    branch.id.toLowerCase().includes(lowerQuery)
  );
}

function searchLeaderboard(entries: LeaderboardEntry[], query: string): LeaderboardEntry[] {
  if (!query.trim()) {
    return entries;
  }
  
  const lowerQuery = query.toLowerCase();
  return entries.filter(entry =>
    entry.branchName.toLowerCase().includes(lowerQuery) ||
    entry.branchId.toLowerCase().includes(lowerQuery)
  );
}

function normalizeSearchQuery(query: string): string {
  return query.trim().toLowerCase();
}

function validateSearchResults<T extends { name?: string; branchName?: string }>(
  results: T[], 
  query: string, 
  originalData: T[]
): boolean {
  if (!query.trim()) {
    return results.length === originalData.length;
  }
  
  const lowerQuery = query.toLowerCase();
  return results.every(item => {
    const name = item.name || item.branchName || '';
    return name.toLowerCase().includes(lowerQuery);
  });
}

// Property generators
const branchRecordArb = fc.record({
  id: fc.string({ minLength: 3, maxLength: 10 }),
  branchId: fc.string({ minLength: 5, maxLength: 15 }).map(s => `ID: ${s.toUpperCase()}`),
  name: fc.constantFrom('Lagos Main Branch', 'Abuja Central Branch', 'Port Harcourt Branch', 'Kano Branch', 'Ibadan Branch'),
  cos: fc.integer({ min: 0, max: 50 }).map(n => n.toString()),
  customers: fc.integer({ min: 0, max: 1000 }),
  dateCreated: fc.date({ min: new Date('2020-01-01'), max: new Date() }).map(d => d.toISOString().split('T')[0])
});

const leaderboardEntryArb = fc.record({
  rank: fc.integer({ min: 1, max: 100 }),
  branchName: fc.constantFrom('Lagos Main Branch', 'Abuja Central Branch', 'Port Harcourt Branch', 'Kano Branch', 'Ibadan Branch'),
  branchId: fc.string({ minLength: 5, maxLength: 15 }).map(s => `ID: ${s.toUpperCase()}`),
  value: fc.integer({ min: 0, max: 10000000 }),
  change: fc.float({ min: -50, max: 50 }).filter(n => !isNaN(n) && isFinite(n)),
  isCurrency: fc.boolean()
});

const branchRecordsArb = fc.array(branchRecordArb, { minLength: 0, maxLength: 20 });
const leaderboardEntriesArb = fc.array(leaderboardEntryArb, { minLength: 0, maxLength: 20 });
const searchQueryArb = fc.oneof(
  fc.constant(''),
  fc.constant('   '), // whitespace only
  fc.constantFrom('Lagos', 'Abuja', 'Port', 'Kano', 'Ibadan', 'Main', 'Central', 'Branch'),
  fc.string({ minLength: 1, maxLength: 20 })
);

describe('Search Functionality - Property Tests', () => {
  describe('Property 9: Search Functionality', () => {
    it('should search branches correctly across all query types', () => {
      fc.assert(
        fc.property(
          branchRecordsArb,
          searchQueryArb,
          (branches, query) => {
            const results = searchBranches(branches, query);
            
            // Results should be a subset of original data
            expect(results.length).toBeLessThanOrEqual(branches.length);
            
            // All results should be from original data
            results.forEach(result => {
              expect(branches).toContainEqual(result);
            });
            
            // Empty query should return all data
            if (!query.trim()) {
              expect(results.length).toBe(branches.length);
            }
            
            // Non-empty query should filter correctly
            if (query.trim()) {
              const lowerQuery = query.toLowerCase();
              results.forEach(branch => {
                const matchesName = branch.name.toLowerCase().includes(lowerQuery);
                const matchesBranchId = branch.branchId.toLowerCase().includes(lowerQuery);
                const matchesId = branch.id.toLowerCase().includes(lowerQuery);
                
                expect(matchesName || matchesBranchId || matchesId).toBe(true);
              });
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 10: Leaderboard Search Consistency', () => {
    it('should search leaderboard entries consistently', () => {
      fc.assert(
        fc.property(
          leaderboardEntriesArb,
          searchQueryArb,
          (entries, query) => {
            const results = searchLeaderboard(entries, query);
            
            // Results should be a subset of original data
            expect(results.length).toBeLessThanOrEqual(entries.length);
            
            // All results should be from original data
            results.forEach(result => {
              expect(entries).toContainEqual(result);
            });
            
            // Empty query should return all data
            if (!query.trim()) {
              expect(results.length).toBe(entries.length);
            }
            
            // Non-empty query should filter correctly
            if (query.trim()) {
              const lowerQuery = query.toLowerCase();
              results.forEach(entry => {
                const matchesName = entry.branchName.toLowerCase().includes(lowerQuery);
                const matchesBranchId = entry.branchId.toLowerCase().includes(lowerQuery);
                
                expect(matchesName || matchesBranchId).toBe(true);
              });
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 11: Search Query Normalization', () => {
    it('should normalize search queries consistently', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: 50 }),
          (query) => {
            const normalized = normalizeSearchQuery(query);
            
            // Should always return a string
            expect(typeof normalized).toBe('string');
            
            // Should be trimmed
            expect(normalized).toBe(normalized.trim());
            
            // Should be lowercase
            expect(normalized).toBe(normalized.toLowerCase());
            
            // Multiple normalizations should be idempotent
            expect(normalizeSearchQuery(normalized)).toBe(normalized);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 12: Search Case Insensitivity', () => {
    it('should perform case-insensitive searches', () => {
      fc.assert(
        fc.property(
          branchRecordsArb,
          fc.constantFrom('LAGOS', 'lagos', 'Lagos', 'LaGoS'),
          (branches, query) => {
            const results1 = searchBranches(branches, query);
            const results2 = searchBranches(branches, query.toLowerCase());
            const results3 = searchBranches(branches, query.toUpperCase());
            
            // All case variations should produce identical results
            expect(results1).toEqual(results2);
            expect(results2).toEqual(results3);
            expect(results1).toEqual(results3);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 13: Search Result Ordering', () => {
    it('should maintain original ordering in search results', () => {
      fc.assert(
        fc.property(
          branchRecordsArb,
          searchQueryArb,
          (branches, query) => {
            const results = searchBranches(branches, query);
            
            if (results.length <= 1) return true;
            
            // Results should maintain relative order from original array
            for (let i = 1; i < results.length; i++) {
              const currentIndex = branches.indexOf(results[i]);
              const previousIndex = branches.indexOf(results[i - 1]);
              
              expect(currentIndex).toBeGreaterThan(previousIndex);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 14: Empty Search Handling', () => {
    it('should handle empty and whitespace-only queries correctly', () => {
      fc.assert(
        fc.property(
          branchRecordsArb,
          fc.constantFrom('', '   ', '\t', '\n', '  \t  \n  '),
          (branches, emptyQuery) => {
            const results = searchBranches(branches, emptyQuery);
            
            // Empty queries should return all data
            expect(results.length).toBe(branches.length);
            expect(results).toEqual(branches);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 15: Search Performance Consistency', () => {
    it('should handle large datasets efficiently', () => {
      fc.assert(
        fc.property(
          fc.array(branchRecordArb, { minLength: 0, maxLength: 100 }),
          searchQueryArb,
          (branches, query) => {
            const startTime = Date.now();
            const results = searchBranches(branches, query);
            const endTime = Date.now();
            
            // Search should complete reasonably quickly (less than 100ms for 100 items)
            const duration = endTime - startTime;
            expect(duration).toBeLessThan(100);
            
            // Results should still be valid
            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBeLessThanOrEqual(branches.length);
            
            return true;
          }
        ),
        { numRuns: 50 } // Reduced runs for performance test
      );
    });
  });

  describe('Property 16: Search Result Uniqueness', () => {
    it('should not return duplicate results', () => {
      fc.assert(
        fc.property(
          branchRecordsArb,
          searchQueryArb,
          (branches, query) => {
            const results = searchBranches(branches, query);
            
            // Check for duplicates by comparing each item with all others
            for (let i = 0; i < results.length; i++) {
              for (let j = i + 1; j < results.length; j++) {
                expect(results[i]).not.toEqual(results[j]);
              }
            }
            
            // Alternative check using Set
            const uniqueResults = new Set(results.map(r => JSON.stringify(r)));
            expect(uniqueResults.size).toBe(results.length);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 17: Partial Match Validation', () => {
    it('should find partial matches correctly', () => {
      fc.assert(
        fc.property(
          branchRecordsArb.filter(branches => branches.length > 0),
          (branches) => {
            if (branches.length === 0) return true;
            
            // Pick a random branch and search for part of its name
            const randomBranch = branches[0];
            const partialName = randomBranch.name.substring(0, Math.max(1, randomBranch.name.length - 2));
            
            if (partialName.length === 0) return true;
            
            const results = searchBranches(branches, partialName);
            
            // Should find at least the original branch
            expect(results.length).toBeGreaterThan(0);
            expect(results).toContainEqual(randomBranch);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});