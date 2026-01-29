# Customer Count Discrepancy Investigation

## Problem Statement
The customer page shows **4 total customers**, but the branch page table displays multiple branches with customer counts (2, 0, 4, 0, 2, 0, 2, 3, 2) that don't correspond to this total.

## Root Cause Analysis

### 1. **Different Data Sources**

#### Customer Page (Shows 4 total):
- **Service**: `enhancedUserService.getCustomers()`
- **Data Source**: Combines two endpoints:
  - `/admin/staff/my-staff` (staff members)
  - `/users/branches/{branch}` (users by branch)
- **Logic**: Filters users with roles: `user`, `customer`, or `client`
- **Result**: 4 total customers

#### Branch Page (Shows individual branch counts):
- **Service**: `userService.getUsersByBranch()` (called per branch)
- **Data Source**: `/users/branches/{branch}` (per branch endpoint)
- **Logic**: Same role filtering: `user`, `customer`, or `client`
- **Result**: Multiple branch counts that don't add up

#### Dashboard Statistics:
- **Service**: `accurateDashboardService.getAccurateKPIs()`
- **Data Source**: `unifiedUserService.getUsers()` → `/admin/staff/my-staff`
- **Logic**: Same role filtering: `user`, `customer`, or `client`

### 2. **The Core Issue: Data Source Inconsistency**

The problem is that **different endpoints return different user sets**:

1. **Customer Page** uses `enhancedUserService` which:
   - Fetches from `/admin/staff/my-staff` (gets staff with roles)
   - Also fetches from `/users/branches/{branch}` for each branch
   - Combines and deduplicates the results
   - Returns **4 total customers**

2. **Branch Page** uses `userService.getUsersByBranch()` which:
   - Calls `/users/branches/{branch}` for each branch individually
   - **No cross-branch deduplication**
   - Each branch query is independent
   - Same customer could appear in multiple branches

3. **Dashboard** uses `unifiedUserService` which:
   - Only calls `/admin/staff/my-staff`
   - May miss customers who are not in the staff endpoint

### 3. **Evidence from Code Analysis**

#### Branch Page Logic (app/dashboard/system-admin/branches/page.tsx):
```typescript
// Get user counts for each branch
const branchRecordsWithCounts = await Promise.all(
  branchRecords.map(async (record) => {
    const branchUsers = await userService.getUsersByBranch(record.name, { page: 1, limit: 1000 });
    const usersData = branchUsers?.data || [];
    const customers = usersData.filter(user =>
      user.role === 'user' ||
      user.role === 'customer' ||
      user.role === 'client'
    );
    return {
      ...record,
      customers: customers.length, // Individual branch count
    };
  })
);
```

#### Customer Page Logic (app/dashboard/hq/customers/page.tsx):
```typescript
const customersResponse = await enhancedUserService.getCustomers({
  page,
  limit: itemsPerPage,
  // ... filters
});
setTotalCustomers(customersResponse.pagination.total); // Global total: 4
```

#### Enhanced User Service Logic (lib/services/enhancedUserService.ts):
```typescript
async getCustomers(params?: CustomerFilterParams): Promise<PaginatedResponse<EnhancedUser>> {
  const allUsers = await this.getAllUsersWithRoles(); // Combines multiple endpoints
  
  let customers = allUsers.filter(user => {
    const isCustomer = user.role === 'user' || 
                      user.role === 'customer' ||
                      user.role === 'client';
    return isCustomer;
  });
  // Returns deduplicated global count
}
```

### 4. **Endpoint Analysis**

| Endpoint | Used By | Returns | Role Field | Deduplication |
|----------|---------|---------|------------|---------------|
| `/admin/staff/my-staff` | Dashboard, Enhanced Service | Staff with roles | ✅ Yes | N/A |
| `/users/branches/{branch}` | Branch Page, Enhanced Service | Branch users | ✅ Yes | ❌ No |
| `/admin/users` | Not used (broken) | Users without roles | ❌ No | N/A |

### 5. **The Discrepancy Explained**

1. **Customer Page (4 total)**: Uses enhanced service that combines `/admin/staff/my-staff` + all branch endpoints, then deduplicates
2. **Branch Page (17+ total)**: Calls each branch endpoint independently, counts customers per branch without deduplication
3. **Same customers appear in multiple branches**, causing inflated counts on branch page

## Potential Scenarios

### Scenario A: Customers Assigned to Multiple Branches
- Customer A appears in both "Osogbo" and "Ikire" branches
- Customer Page counts them once (4 total)
- Branch Page counts them twice (2 + 4 = 6, plus others)

### Scenario B: Different User Sets
- `/admin/staff/my-staff` returns 4 customers
- `/users/branches/{branch}` endpoints return additional users not in staff endpoint
- Branch page sees more users than customer page

### Scenario C: Data Synchronization Issues
- Different endpoints have different data freshness
- Some endpoints cached, others real-time
- Timing differences cause inconsistencies

## Recommended Solutions

### Immediate Fix: Standardize Data Source
1. **Use same data source** for both customer totals and branch counts
2. **Implement cross-branch deduplication** in branch page
3. **Add customer ID tracking** to prevent double counting

### Long-term Fix: Backend Enhancement
1. **Request dedicated `/admin/customers` endpoint** with proper pagination
2. **Add branch assignment logic** to prevent multi-branch customers
3. **Implement consistent caching** across all endpoints

### Code Changes Needed
1. **Branch Page**: Modify to use enhanced user service instead of per-branch queries
2. **Customer Counting**: Implement global deduplication logic
3. **Data Validation**: Add checks for customer uniqueness across branches

## Next Steps
1. Verify which scenario is occurring by examining actual API responses
2. Implement standardized customer counting logic
3. Add logging to track customer assignments across branches
4. Test with real data to confirm fix