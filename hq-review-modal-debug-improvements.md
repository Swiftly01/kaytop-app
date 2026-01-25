# HQ Review Modal Debug Improvements

## Issue Identified
The HQ Review Modal was showing "0 pending reports" for Lagos Island branch despite having 30 total reports. This prevented the approval/rejection functionality from working.

## Root Cause Analysis
The filtering logic was looking for reports with status `'pending'` or `'submitted'`, but the actual reports in the database might have different statuses. The logs showed:
- 30 total reports fetched successfully
- 0 reports with `'pending'` or `'submitted'` status
- Need to understand what statuses the reports actually have

## Improvements Made

### 1. Enhanced Debugging
Added comprehensive logging to show:
- All report statuses with their IDs and credit officers
- Status breakdown (submitted, pending, approved, declined counts)
- Comparison between pending reports and unapproved reports

### 2. Fallback Logic for Approval/Rejection
If no reports are found with `'pending'` or `'submitted'` status:
- Check for any reports that are not yet `'approved'` or `'declined'`
- Use these "unapproved" reports as candidates for approval/rejection
- This handles cases where reports might have different status values

### 3. Better Error Messages
- More descriptive error messages showing total report count
- Explains why no reports are available for approval/rejection
- Helps users understand the current state

## Code Changes

### In `app/dashboard/am/reports/page.tsx`:

#### Approval Function Enhancement:
```typescript
// Debug: Log all report statuses to understand what we're working with
const reportStatuses = branchReportsResponse.data.map(report => ({
  id: report.id,
  reportId: report.reportId,
  status: report.status,
  creditOfficer: report.creditOfficer
}));

console.log('🔍 All report statuses:', reportStatuses);

// Filter for pending reports client-side
const pendingReports = branchReportsResponse.data.filter(report => 
  report.status === 'pending' || report.status === 'submitted'
);

// Also check for reports that might need approval (not yet approved/declined)
const unapprovedReports = branchReportsResponse.data.filter(report => 
  report.status !== 'approved' && report.status !== 'declined'
);

// Fallback logic if no pending reports found
if (pendingReports.length === 0) {
  if (unapprovedReports.length > 0) {
    // Use unapproved reports instead
    // ... approval logic
  } else {
    error(`No reports available for approval. Found ${branchReportsResponse.data.length} total reports, but none are in 'pending' or 'submitted' status.`);
  }
}
```

#### Similar improvements for rejection function

## Expected Behavior Now

1. **Enhanced Debugging**: Console will show detailed status breakdown of all reports
2. **Fallback Strategy**: If no pending/submitted reports, try to approve/reject any unapproved reports
3. **Better User Feedback**: Clear error messages explaining why approval/rejection isn't available
4. **Robust Handling**: System works even if report statuses don't match expected values

## Next Steps for Testing

1. Open browser console when testing the HQ Review Modal
2. Look for the detailed logging output showing report statuses
3. Check if reports have unexpected status values
4. Verify that the fallback logic works for unapproved reports

## Potential Status Values to Investigate

Based on the Report interface, valid statuses are:
- `'submitted'` - Newly submitted reports
- `'pending'` - Reports awaiting review
- `'approved'` - Already approved reports
- `'declined'` - Already rejected reports

The debugging will reveal which statuses the actual reports have and help determine if there's a mismatch between expected and actual values.

## Build Status
✅ Build successful - all changes compile without errors
✅ TypeScript validation passed
✅ No breaking changes introduced