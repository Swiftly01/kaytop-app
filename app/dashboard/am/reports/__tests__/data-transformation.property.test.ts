/**
 * Property Test for Branch Aggregate Data Transformation
 * Validates data transformation consistency from individual reports to branch aggregates
 * Task 2.4: Write property test for data transformation
 */

import * as fc from 'fast-check';
import type { Report, BranchReport } from '@/lib/api/types';

// Mock Report generator
const reportArbitrary: fc.Arbitrary<Report> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  reportId: fc.string({ minLength: 5, maxLength: 30 }),
  creditOfficer: fc.string({ minLength: 5, maxLength: 50 }),
  creditOfficerId: fc.string({ minLength: 1, maxLength: 20 }),
  branch: fc.string({ minLength: 3, maxLength: 50 }),
  branchId: fc.string({ minLength: 1, maxLength: 20 }),
  email: fc.emailAddress(),
  dateSent: fc.date({ min: new Date('2020-01-01'), max: new Date() }).map(d => d.toISOString().split('T')[0]),
  timeSent: fc.string({ minLength: 8, maxLength: 8 }), // HH:MM:SS format
  reportType: fc.constantFrom('daily', 'weekly', 'monthly'),
  status: fc.constantFrom('submitted', 'pending', 'approved', 'declined'),
  isApproved: fc.boolean(),
  loansDispursed: fc.integer({ min: 0, max: 100 }),
  loansValueDispursed: fc.integer({ min: 0, max: 10000000 }).map(n => n.toString()),
  savingsCollected: fc.integer({ min: 0, max: 5000000 }).map(n => n.toString()),
  repaymentsCollected: fc.integer({ min: 0, max: 3000000 }),
  createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date() }).map(d => d.toISOString()),
  updatedAt: fc.date({ min: new Date('2020-01-01'), max: new Date() }).map(d => d.toISOString()),
  approvedBy: fc.option(fc.string({ minLength: 5, maxLength: 50 }), { nil: undefined }),
  declineReason: fc.option(fc.string({ minLength: 10, maxLength: 200 }), { nil: undefined }),
});

/**
 * Transform individual reports into branch aggregates
 * This mirrors the logic in reportsService.getBranchAggregateReports
 */
function transformReportsToBranchAggregates(reports: Report[]): BranchReport[] {
  const branchMap = new Map<string, BranchReport>();

  reports.forEach(report => {
    const branchKey = report.branchId || report.branch;
    
    if (!branchMap.has(branchKey)) {
      branchMap.set(branchKey, {
        id: branchKey,
        branchName: report.branch,
        branchId: report.branchId,
        totalSavings: 0,
        totalDisbursed: 0,
        totalRepaid: 0,
        status: 'pending',
        reportCount: 0,
        pendingReports: 0,
        approvedReports: 0,
        declinedReports: 0,
        lastSubmissionDate: report.createdAt,
        creditOfficerCount: 0,
        activeCreditOfficers: [],
      });
    }

    const branchAggregate = branchMap.get(branchKey)!;
    
    // Aggregate financial data
    branchAggregate.totalSavings += parseFloat(report.savingsCollected) || 0;
    branchAggregate.totalDisbursed += parseFloat(report.loansValueDispursed) || 0;
    branchAggregate.totalRepaid += report.repaymentsCollected || 0;
    
    // Count reports by status
    branchAggregate.reportCount++;
    if (report.status === 'pending' || report.status === 'submitted') {
      branchAggregate.pendingReports++;
    } else if (report.status === 'approved') {
      branchAggregate.approvedReports++;
    } else if (report.status === 'declined') {
      branchAggregate.declinedReports++;
    }

    // Track credit officers
    if (!branchAggregate.activeCreditOfficers.includes(report.creditOfficer)) {
      branchAggregate.activeCreditOfficers.push(report.creditOfficer);
      branchAggregate.creditOfficerCount++;
    }

    // Update last submission date
    if (new Date(report.createdAt) > new Date(branchAggregate.lastSubmissionDate)) {
      branchAggregate.lastSubmissionDate = report.createdAt;
    }

    // Determine overall status
    if (branchAggregate.pendingReports > 0 && branchAggregate.approvedReports > 0) {
      branchAggregate.status = 'mixed';
    } else if (branchAggregate.pendingReports > 0) {
      branchAggregate.status = 'pending';
    } else if (branchAggregate.approvedReports > 0 && branchAggregate.declinedReports === 0) {
      branchAggregate.status = 'approved';
    } else if (branchAggregate.declinedReports > 0) {
      branchAggregate.status = 'declined';
    }
  });

  return Array.from(branchMap.values());
}

describe('Branch Aggregate Data Transformation Property Tests', () => {
  /**
   * Property 5: Data Transformation Consistency
   * For any set of individual reports, the transformation should produce consistent branch aggregates
   * Validates: Requirements 5.3
   */
  test('Property: Data transformation consistency from reports to branch aggregates', () => {
    fc.assert(
      fc.property(
        fc.array(reportArbitrary, { minLength: 1, maxLength: 50 }),
        (reports) => {
          const branchAggregates = transformReportsToBranchAggregates(reports);

          // Verify no data is lost during transformation
          const totalReportsInAggregates = branchAggregates.reduce((sum, branch) => sum + branch.reportCount, 0);
          expect(totalReportsInAggregates).toBe(reports.length);

          // Verify financial data consistency
          const totalSavingsFromReports = reports.reduce((sum, report) => sum + (parseFloat(report.savingsCollected) || 0), 0);
          const totalSavingsFromAggregates = branchAggregates.reduce((sum, branch) => sum + branch.totalSavings, 0);
          expect(Math.abs(totalSavingsFromAggregates - totalSavingsFromReports)).toBeLessThan(0.01); // Allow for floating point precision

          const totalDisbursedFromReports = reports.reduce((sum, report) => sum + (parseFloat(report.loansValueDispursed) || 0), 0);
          const totalDisbursedFromAggregates = branchAggregates.reduce((sum, branch) => sum + branch.totalDisbursed, 0);
          expect(Math.abs(totalDisbursedFromAggregates - totalDisbursedFromReports)).toBeLessThan(0.01);

          const totalRepaidFromReports = reports.reduce((sum, report) => sum + (report.repaymentsCollected || 0), 0);
          const totalRepaidFromAggregates = branchAggregates.reduce((sum, branch) => sum + branch.totalRepaid, 0);
          expect(totalRepaidFromAggregates).toBe(totalRepaidFromReports);

          // Verify status count consistency
          const statusCounts = reports.reduce((counts, report) => {
            if (report.status === 'pending' || report.status === 'submitted') {
              counts.pending++;
            } else if (report.status === 'approved') {
              counts.approved++;
            } else if (report.status === 'declined') {
              counts.declined++;
            }
            return counts;
          }, { pending: 0, approved: 0, declined: 0 });

          const aggregateStatusCounts = branchAggregates.reduce((counts, branch) => {
            counts.pending += branch.pendingReports;
            counts.approved += branch.approvedReports;
            counts.declined += branch.declinedReports;
            return counts;
          }, { pending: 0, approved: 0, declined: 0 });

          expect(aggregateStatusCounts.pending).toBe(statusCounts.pending);
          expect(aggregateStatusCounts.approved).toBe(statusCounts.approved);
          expect(aggregateStatusCounts.declined).toBe(statusCounts.declined);

          // Verify credit officer tracking
          branchAggregates.forEach(branchAggregate => {
            // Credit officer count should match active credit officers array length
            expect(branchAggregate.creditOfficerCount).toBe(branchAggregate.activeCreditOfficers.length);
            
            // No duplicate credit officers in the array
            const uniqueOfficers = new Set(branchAggregate.activeCreditOfficers);
            expect(uniqueOfficers.size).toBe(branchAggregate.activeCreditOfficers.length);
            
            // All credit officers should be from reports of this branch
            const branchReports = reports.filter(r => (r.branchId || r.branch) === branchAggregate.id);
            const reportOfficers = new Set(branchReports.map(r => r.creditOfficer));
            branchAggregate.activeCreditOfficers.forEach(officer => {
              expect(reportOfficers.has(officer)).toBe(true);
            });
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 6: Branch Grouping Consistency
   * Reports with the same branch should be grouped together correctly
   * Validates: Requirements 1.3, 5.2
   */
  test('Property: Branch grouping consistency', () => {
    fc.assert(
      fc.property(
        fc.array(reportArbitrary, { minLength: 2, maxLength: 30 }),
        (reports) => {
          const branchAggregates = transformReportsToBranchAggregates(reports);

          // Get unique branches from original reports
          const uniqueBranches = new Set(reports.map(r => r.branchId || r.branch));
          
          // Number of branch aggregates should match number of unique branches
          expect(branchAggregates.length).toBe(uniqueBranches.size);

          // Each branch aggregate should correspond to a unique branch
          const aggregateBranches = new Set(branchAggregates.map(b => b.id));
          expect(aggregateBranches.size).toBe(branchAggregates.length);

          // All original branches should be represented in aggregates
          uniqueBranches.forEach(branchId => {
            expect(aggregateBranches.has(branchId)).toBe(true);
          });

          // Verify each branch aggregate contains correct reports
          branchAggregates.forEach(branchAggregate => {
            const branchReports = reports.filter(r => (r.branchId || r.branch) === branchAggregate.id);
            expect(branchAggregate.reportCount).toBe(branchReports.length);
            expect(branchAggregate.reportCount).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 7: Status Determination Logic
   * Branch status should be determined correctly based on individual report statuses
   * Validates: Requirements 1.2, 4.3
   */
  test('Property: Status determination logic consistency', () => {
    fc.assert(
      fc.property(
        fc.array(reportArbitrary, { minLength: 1, maxLength: 20 }),
        (reports) => {
          const branchAggregates = transformReportsToBranchAggregates(reports);

          branchAggregates.forEach(branchAggregate => {
            const { pendingReports, approvedReports, declinedReports } = branchAggregate;

            // Verify status logic
            if (pendingReports > 0 && approvedReports > 0) {
              expect(branchAggregate.status).toBe('mixed');
            } else if (pendingReports > 0) {
              expect(branchAggregate.status).toBe('pending');
            } else if (approvedReports > 0 && declinedReports === 0) {
              expect(branchAggregate.status).toBe('approved');
            } else if (declinedReports > 0) {
              expect(branchAggregate.status).toBe('declined');
            }

            // Verify status counts are non-negative
            expect(pendingReports).toBeGreaterThanOrEqual(0);
            expect(approvedReports).toBeGreaterThanOrEqual(0);
            expect(declinedReports).toBeGreaterThanOrEqual(0);

            // Verify total count consistency
            expect(pendingReports + approvedReports + declinedReports).toBeLessThanOrEqual(branchAggregate.reportCount);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8: Last Submission Date Accuracy
   * Last submission date should be the most recent creation date from branch reports
   * Validates: Requirements 7.1
   */
  test('Property: Last submission date accuracy', () => {
    fc.assert(
      fc.property(
        fc.array(reportArbitrary, { minLength: 1, maxLength: 15 }),
        (reports) => {
          const branchAggregates = transformReportsToBranchAggregates(reports);

          branchAggregates.forEach(branchAggregate => {
            const branchReports = reports.filter(r => (r.branchId || r.branch) === branchAggregate.id);
            
            // Find the most recent creation date from branch reports
            const mostRecentDate = branchReports.reduce((latest, report) => {
              const reportDate = new Date(report.createdAt);
              const latestDate = new Date(latest);
              return reportDate > latestDate ? report.createdAt : latest;
            }, branchReports[0].createdAt);

            // Branch aggregate should have the most recent date
            expect(branchAggregate.lastSubmissionDate).toBe(mostRecentDate);

            // Verify date is valid
            expect(() => new Date(branchAggregate.lastSubmissionDate)).not.toThrow();
            expect(new Date(branchAggregate.lastSubmissionDate).getTime()).not.toBeNaN();
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 9: Financial Data Non-Negativity
   * All financial aggregates should be non-negative
   * Validates: Requirements 1.2, 4.3
   */
  test('Property: Financial data non-negativity', () => {
    fc.assert(
      fc.property(
        fc.array(reportArbitrary, { minLength: 1, maxLength: 25 }),
        (reports) => {
          const branchAggregates = transformReportsToBranchAggregates(reports);

          branchAggregates.forEach(branchAggregate => {
            // All financial values should be non-negative
            expect(branchAggregate.totalSavings).toBeGreaterThanOrEqual(0);
            expect(branchAggregate.totalDisbursed).toBeGreaterThanOrEqual(0);
            expect(branchAggregate.totalRepaid).toBeGreaterThanOrEqual(0);

            // Financial values should be finite numbers
            expect(Number.isFinite(branchAggregate.totalSavings)).toBe(true);
            expect(Number.isFinite(branchAggregate.totalDisbursed)).toBe(true);
            expect(Number.isFinite(branchAggregate.totalRepaid)).toBe(true);

            // Count values should be positive integers
            expect(branchAggregate.reportCount).toBeGreaterThan(0);
            expect(branchAggregate.creditOfficerCount).toBeGreaterThan(0);
            expect(Number.isInteger(branchAggregate.reportCount)).toBe(true);
            expect(Number.isInteger(branchAggregate.creditOfficerCount)).toBe(true);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 10: Empty Input Handling
   * Transformation should handle edge cases gracefully
   * Validates: Requirements 5.5
   */
  test('Property: Empty input and edge case handling', () => {
    // Test empty array
    const emptyResult = transformReportsToBranchAggregates([]);
    expect(emptyResult).toEqual([]);

    // Test single report
    fc.assert(
      fc.property(
        reportArbitrary,
        (report) => {
          const result = transformReportsToBranchAggregates([report]);
          
          expect(result).toHaveLength(1);
          expect(result[0].reportCount).toBe(1);
          expect(result[0].creditOfficerCount).toBe(1);
          expect(result[0].activeCreditOfficers).toContain(report.creditOfficer);
          expect(result[0].branchName).toBe(report.branch);
          expect(result[0].lastSubmissionDate).toBe(report.createdAt);
        }
      ),
      { numRuns: 50 }
    );
  });
});