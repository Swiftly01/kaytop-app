# Admin Users Endpoint Implementation Fix (Corrected)

## Overview
Updated the customer pages in both System Admin and HQ Manager dashboards to use the `/admin/users?page=1&limit=10` endpoint. Since this endpoint doesn't support role filtering via query parameters, we implement client-side role filtering while still utilizing the endpoint for data fetching.

## Key Limitation Discovered
**Important**: The `/admin/users` endpoint does NOT support role filtering via query parameters. Role filtering must be done client-side after fetching the data.

## Changes Made

### 1. Updated UnifiedUserService (`lib/services/unifiedUser.ts`)
- Added new `getAllUsers()` method that directly calls `/admin/users` endpoint
- Supports pagination with `page` and `limit` parameters
- **Removed role parameter from API call** (not supported by backend)
- Implements client-side role filtering after data fetch
- Supports branch and state filtering (if supported by backend)
- Handles multiple response formats for flexibility
- Includes comprehensive logging for debugging

### 2. Updated System Admin Customers Page (`app/dashboard/system-admin/customers/page.tsx`)
- Uses `unifiedUserService.getAllUsers()` to fetch from `/admin/users` endpoint
- Fetches larger dataset (5x page size) to account for client-side role filtering
- Implements client-side role filtering for customers
- Uses client-side pagination after filtering
- Improved error handling and logging

### 3. Updated HQ Manager Customers Page (`app/dashboard/am/customers/page.tsx`)
- Applied identical changes as System Admin page
- Ensures consistent behavior across both dashboards

## API Endpoint Usage

### Actual Implementation
```typescript
// Fetch larger dataset since we can't filter by role on server
const usersResponse = await unifiedUserService.getAllUsers({
  page: 1, // Always page 1 since we filter client-side
  limit: Math.max(itemsPerPage * 5, 100), // Fetch more to account for filtering
});

// Client-side role filtering
const customerUsers = usersResponse.data.filter(user => user.role === 'customer');
```

### API Request Format
```
GET {{baseUrl}}/admin/users?page=1&limit=50
Authorization: Bearer {{token}}
```

**Note**: No `role` parameter is included as it's not supported.

### Expected API Response Format
```json
{
  "users": [
    {
      "id": 40,
      "firstName": "Ade",
      "lastName": "Mark",
      "email": "adminhq@mailsac.com",
      "mobileNumber": "0908787874",
      "role": "hq_manager",
      "isVerified": true,
      "accountStatus": "fully_verified",
      "state": "Lagos",
      "branch": "Lagos Island",
      "verificationStatus": "verified",
      "createdAt": "2026-01-21T10:38:54.175Z",
      "createdBy": {
        "id": 6,
        "firstName": "System",
        "lastName": "Admin",
        "email": "admin@kaytop.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

## Implementation Strategy

### Hybrid Approach
1. **Server-side pagination**: Use `/admin/users` with `page` and `limit` for data fetching
2. **Client-side filtering**: Filter by role after receiving data
3. **Adaptive fetching**: Fetch larger datasets to ensure enough customers after filtering
4. **Client-side pagination**: Re-paginate filtered results on frontend

### Performance Considerations
- Fetches 5x the required page size to account for role filtering
- Minimum fetch size of 100 records to ensure adequate customer data
- Caching implemented to reduce redundant API calls
- Request deduplication to prevent concurrent identical requests

## Benefits vs Trade-offs

### Benefits
✅ Uses the specified `/admin/users` endpoint as requested
✅ Handles pagination parameters correctly
✅ Maintains expected response format compatibility
✅ Includes comprehensive error handling and logging

### Trade-offs
⚠️ **Less efficient**: Must fetch more data than needed due to client-side filtering
⚠️ **Network overhead**: Transfers non-customer data that gets filtered out
⚠️ **Complexity**: Hybrid server/client pagination approach

## Alternative Recommendation

For optimal performance, consider using a dedicated customer endpoint like:
- `GET /admin/customers?page=1&limit=10` (if available)
- `GET /admin/users/customers?page=1&limit=10` (if can be created)

This would eliminate the need for client-side filtering and improve performance.

## Testing
Use the test file `.kiro/docs/admin-users-test.http` to verify the endpoint works correctly. Note that role filtering tests have been removed since the parameter is not supported.