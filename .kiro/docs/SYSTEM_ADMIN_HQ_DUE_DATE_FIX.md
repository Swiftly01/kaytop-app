# System Admin & HQ Manager Dashboard - Due Date Column Fix

## Issue Summary
The due date column was blank in the missed payments tab for the System Admin dashboard and HQ Manager (Account Manager) dashboard only. BM dashboard was not modified.

## Root Cause Analysis
1. **Generic Table Component**: The `Table` component used by System Admin and HQ Manager dashboards lacked specific column configuration for `missed-payments` table type
2. **Limited Backend Field Mapping**: The data transformation only checked for `dueDate` and `due_date` fields, but backend might use other field names like `nextRepaymentDate`, `dateToBePaid`, etc.

## Changes Made (System Admin & HQ Manager Only)

### 1. Enhanced Generic Table Component
**File**: `app/_components/ui/Table.tsx`
- Added specific column configurations for all System Admin dashboard table types:
  - `missed-payments`: Loan ID, Name, Amount, **Due Date**, Days Missed, Status
  - `disbursements`: Loan ID, Name, Amount, Interest, Date Disbursed, Status  
  - `re-collections`: Loan ID, Name, Amount, Interest, Date Collected, Status
  - `savings`: Account ID, Name, Amount, Interest, Date Created, Status

### 2. Enhanced Backend Data Transformation
**File**: `lib/services/systemAdmin.ts`
- Enhanced `transformMissedPaymentRecord()` method to handle multiple backend field name variations:
  - `dueDate` (primary)
  - `due_date` (snake_case)
  - `nextRepaymentDate` (alternative field name)
  - `next_repayment_date` (snake_case alternative)
  - `dateToBePaid` (alternative field name)
  - `date_to_be_paid` (snake_case alternative)

## Affected Dashboards
- ✅ **System Admin Dashboard** (`/dashboard/system-admin`) - Uses `systemAdminService.getMissedPayments()`
- ✅ **HQ Manager Dashboard** (`/dashboard/am`) - Uses `systemAdminService.getMissedPayments()`
- ❌ **BM Dashboard** - NOT MODIFIED (uses different service and components)

## Technical Details

### Data Flow
1. Both System Admin and HQ Manager dashboards use `systemAdminService.getMissedPayments()`
2. Service calls `/loans/missed` API endpoint
3. Data is transformed via `transformMissedPaymentRecord()` with enhanced field mapping
4. Generic `Table` component now has proper column configuration for `missed-payments` type
5. Due date column displays with proper formatting

### Backend Compatibility
The enhanced transformation handles various backend response formats:
- Standard fields: `dueDate`, `due_date`
- Alternative fields: `nextRepaymentDate`, `next_repayment_date`
- Fallback fields: `dateToBePaid`, `date_to_be_paid`
- Graceful fallback to empty string if no date field is found

### Sorting Support
Both dashboards already had sorting logic for `dueDate` field in their existing code, so no additional changes were needed.

## Expected Result
- ✅ System Admin dashboard missed payments tab now shows due date column
- ✅ HQ Manager dashboard missed payments tab now shows due date column
- ✅ Due dates are properly formatted using existing `formatDate()` utility
- ✅ Due date column is sortable
- ✅ BM dashboard remains unchanged

## Testing Verification
- ✅ No TypeScript compilation errors
- ✅ Existing sorting logic already supports `dueDate` field
- ✅ Backward compatibility maintained
- ✅ Only System Admin and HQ Manager dashboards affected

This focused fix addresses the specific issue for System Admin and HQ Manager dashboards without touching the BM dashboard components or services.