# Backend Pagination Update

The backend now handles pagination for specific endpoints used by System Admin and Account Manager dashboards. Frontend no longer needs to handle pagination logic for these endpoints.

## Updated Endpoints (Actually Used)

### 1. System Admin Dashboard Endpoints
- **Get loan disbursements**: `{{baseUrl}}/loans/disbursed?page=2&limit=10`
- **Get loan recollections**: `{{baseUrl}}/loans/recollections?page=2&limit=10`
- **Get all savings accounts**: `{{baseUrl}}/savings/all?page=2&limit=10`
- **Get missed payments**: `{{baseUrl}}/loans/missed?page=2&limit=10`

### 2. Account Manager Savings Page
- **Get all savings transactions**: `{{baseUrl}}/savings/transactions/all?page=2&limit=10` (handled by unifiedSavingsService)

## Updated Services

### SystemAdminService (Used by System Admin Dashboard)
```typescript
// These methods now expect backend to return pagination info
await systemAdminService.getDisbursements(page, limit);
await systemAdminService.getRecollections(page, limit);
await systemAdminService.getSavings(page, limit);
await systemAdminService.getMissedPayments(page, limit);
```

## Removed Redundant Services

The following methods were removed as they are not used by any dashboard pages:
- ~~`systemAdminService.getSavingsTransactions()`~~ - Not used (AM uses unifiedSavingsService instead)
- ~~`userService.filterUsers()`~~ - Not used by any dashboard
- ~~`userService.getMyBranchUsers()`~~ - Not used by any dashboard

## Expected Response Format

The backend should return responses in this format:

```typescript
{
  data: [...], // Array of items
  pagination: {
    page: 1,
    limit: 10,
    total: 100,
    totalPages: 10
  }
}
```

## Backward Compatibility

All services maintain backward compatibility with the old response format while preferring the new paginated format when available.

## Usage in System Admin Dashboard

The system admin dashboard uses these services through React Query hooks:

```typescript
const { data: disbursementsData, isLoading, error } = useDisbursementsQuery(currentPage, itemsPerPage);
const { data: recollectionsData } = useRecollectionsQuery(currentPage, itemsPerPage);
const { data: savingsData } = useSavingsQuery(currentPage, itemsPerPage);
const { data: missedPaymentsData } = useMissedPaymentsQuery(currentPage, itemsPerPage);
```

## Benefits

1. **Accurate Pagination**: Backend provides real total counts and page information
2. **Better Performance**: Only requested data is transferred
3. **Consistent UX**: Pagination works correctly across system admin dashboard tabs
4. **Reduced Frontend Logic**: No need to calculate pagination on frontend
5. **Clean Codebase**: Removed unused methods and services