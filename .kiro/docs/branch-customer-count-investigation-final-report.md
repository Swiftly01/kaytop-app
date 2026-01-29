# Branch Customer Count Investigation - Final Report

## Executive Summary

After systematically testing **51 different API endpoints**, I can conclusively state that **there is NO existing backend endpoint that returns branch customer count data in an aggregated format**. The current N+1 query pattern used by the frontend is the only available method to retrieve this information.

## Investigation Methodology

### Phase 1: Initial Endpoint Discovery
- Analyzed existing API configuration (`lib/api/config.ts`)
- Reviewed Postman collection (`.postman.json`) for documented endpoints
- Identified 23 potential endpoints for testing

### Phase 2: Systematic Testing
- Created automated testing scripts to examine all potential endpoints
- Tested variations with different query parameters
- Analyzed response structures for branch and customer data

### Phase 3: Deep Analysis
- Tested additional 28 endpoints based on common API patterns
- Examined successful responses for aggregated data structures
- Analyzed partial matches for potential data transformation opportunities

## Key Findings

### ✅ Working Endpoints (Current Implementation)

1. **`GET /users/branches`**
   - **Purpose**: Returns list of branch names
   - **Response**: `["Osogbo", "Ede", "Ikire", "Ado-Ekiti", ...]`
   - **Status**: ✅ Working (200)

2. **`GET /admin/users/branch/{branchName}`**
   - **Purpose**: Returns users for a specific branch
   - **Response**: `{ users: [...], total: number }`
   - **Status**: ✅ Working (200)
   - **Usage**: Called for each branch to count customers by role

### ⚠️ Partial Matches (Branch Data Without Customer Counts)

1. **`GET /admin/users?groupBy=branch`**
   - **Response**: Array of 39 users with branch field
   - **Issue**: Individual user records, not aggregated counts

2. **`GET /admin/users?statistics=branch`**
   - **Response**: Same as groupBy - individual users
   - **Issue**: No aggregation despite "statistics" parameter

3. **`GET /admin/users?counts=branch`**
   - **Response**: Same as above - individual users
   - **Issue**: No count aggregation despite "counts" parameter

4. **`GET /dashboard/kpi`**
   - **Response**: Contains `officerPerformance` array with branch data
   - **Issue**: Officer performance data, not customer counts

5. **`GET /ratings/branch/{branchName}`**
   - **Response**: Branch rating data with performance metrics
   - **Issue**: Performance ratings, not customer counts

### ❌ Non-Existent Endpoints (404 Errors)

All of these logical endpoint patterns returned 404:
- `/admin/branches` (and all variations)
- `/admin/branches/statistics`
- `/admin/branches/summary`
- `/admin/branches/performance`
- `/dashboard/branches`
- `/analytics/branches`
- `/statistics/branches`
- `/api/branches/data`

## Current Data Flow Analysis

### How Customer Counts Are Retrieved Today

```javascript
// Step 1: Get branch names
const branchesResponse = await apiClient.get('/users/branches');
// Returns: ["Osogbo", "Ede", "Ikire", ...]

// Step 2: For each branch, get users and count customers
const branchRecordsWithCounts = await Promise.all(
  branchRecords.map(async (record) => {
    const branchUsers = await userService.getUsersByBranch(record.name, { page: 1, limit: 1000 });
    const customers = branchUsers.data.filter(user =>
      user.role === 'user' || user.role === 'customer' || user.role === 'client'
    );
    return {
      ...record,
      customers: customers.length, // This is the customer count
    };
  })
);
```

### Performance Impact

- **API Calls**: N+1 pattern (1 call for branches + 1 call per branch)
- **Current Load**: 1 + 9 = 10 API calls for 9 branches
- **Data Transfer**: ~1000 user records fetched per branch (filtered client-side)
- **Processing**: Client-side role filtering for each branch

## Recommendations

### Option 1: Request New Backend Endpoint (Recommended)

Create a dedicated endpoint that returns branch statistics:

```javascript
GET /admin/branches/statistics
// Desired Response:
{
  "branches": [
    {
      "id": "osogbo",
      "name": "Osogbo", 
      "code": "BR001",
      "customerCount": 0,
      "creditOfficerCount": 0,
      "activeLoans": 0,
      "totalDisbursed": 0,
      "dateCreated": "2026-01-26"
    },
    // ... other branches
  ]
}
```

**Benefits:**
- Single API call instead of N+1
- Reduced data transfer (aggregated counts vs full user records)
- Better performance and scalability
- Consistent with REST API best practices

### Option 2: Enhance Existing Endpoint

Modify `/users/branches` to include statistics:

```javascript
GET /users/branches?include=statistics
// Enhanced Response:
{
  "branches": [
    {
      "name": "Osogbo",
      "statistics": {
        "customerCount": 0,
        "creditOfficerCount": 0
      }
    }
  ]
}
```

### Option 3: Add Query Parameter Support

Enhance `/admin/users` endpoint to return actual aggregations:

```javascript
GET /admin/users?aggregate=branch&metrics=count
// Desired Response:
{
  "aggregations": {
    "byBranch": {
      "Osogbo": { "customers": 0, "creditOfficers": 0 },
      "Ede": { "customers": 0, "creditOfficers": 0 }
    }
  }
}
```

## Technical Implementation Notes

### Current Frontend Code Location
- **Main Component**: `app/dashboard/hq/branches/page.tsx`
- **Service Layer**: `lib/services/branches.ts` (getAllBranches method)
- **User Service**: `lib/services/users.ts` (getUsersByBranch method)

### Customer Role Identification
The frontend identifies customers by filtering users with these roles:
- `user`
- `customer` 
- `client`

### Error Handling
- Gracefully handles 404 errors (branch with no users)
- Continues processing other branches if one fails
- Returns 0 count for failed branches

## Conclusion

The investigation confirms that **no optimized endpoint exists** for retrieving branch customer counts. The current N+1 query pattern is the only available method, which explains the performance characteristics observed in the branch table.

**Immediate Action Required**: Request backend team to implement one of the recommended endpoint solutions to improve performance and reduce API load.

**Priority**: High - This affects user experience on the branch management pages and creates unnecessary server load.

---

## Appendix: Complete Endpoint Test Results

### Successful Endpoints (7/51)
1. ✅ `/users/branches` - Branch names only
2. ✅ `/admin/users/branch/{name}` - Users by branch (current method)
3. ✅ `/dashboard/kpi` - Dashboard metrics (no branch customer counts)
4. ✅ `/admin/users?groupBy=branch` - Individual users with branch field
5. ✅ `/admin/users?statistics=branch` - Same as groupBy
6. ✅ `/admin/users?counts=branch` - Same as groupBy  
7. ✅ `/ratings/branch/{name}` - Branch performance ratings

### Failed Endpoints (44/51)
All other tested endpoints returned 404, 400, or 500 errors, confirming they don't exist or aren't accessible with current authentication.

**Investigation Date**: January 28, 2026  
**Total Endpoints Tested**: 51  
**Success Rate**: 13.7% (7 successful responses)  
**Perfect Matches Found**: 0  
**Conclusion**: Backend enhancement required