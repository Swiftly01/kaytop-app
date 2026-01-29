# Customer Count Data Flow Investigation

## Overview
This document explains how the customer count data in the branch table is retrieved from the backend and displayed in the frontend.

## Data Flow Architecture

### 1. **Frontend Component: Branch Table**
- **File**: `app/dashboard/hq/branches/page.tsx`
- **Component**: `BranchesPage`
- **Table Component**: `app/_components/ui/Table.tsx`

### 2. **Data Fetching Process**

#### Step 1: Fetch Branch Names
```typescript
// In lib/services/branches.ts - getAllBranches()
const branchesResponse = await apiClient.get<any>(API_ENDPOINTS.USERS.BRANCHES);
```
- **Endpoint**: `/users/branches`
- **Returns**: Array of branch names (strings)
- **Example**: `["Osogbo", "Ede", "Ikire", "Ado-Ekiti", ...]`

#### Step 2: Fetch Users for Each Branch
```typescript
// In app/dashboard/hq/branches/page.tsx - fetchBranchData()
const branchUsers = await userService.getUsersByBranch(record.name, { page: 1, limit: 1000 });
```
- **Endpoint**: `/admin/users/branch/{branchName}`
- **Returns**: Paginated response with users array
- **Example**: `{ users: [...], total: 25 }`

#### Step 3: Filter Users by Role
```typescript
const customers = usersData.filter(user =>
  user.role === 'user' ||
  user.role === 'customer' ||
  user.role === 'client'
);
```

#### Step 4: Count and Display
```typescript
return {
  ...record,
  customers: customers.length, // This becomes the customer count
};
```

## Backend API Endpoints

### Primary Endpoints Used:

1. **Get Branch Names**
   - **Endpoint**: `GET /users/branches`
   - **Purpose**: Retrieve list of all branch names
   - **Response Format**: `string[]` or `{ success: true, data: string[] }`

2. **Get Users by Branch**
   - **Endpoint**: `GET /admin/users/branch/{branchName}`
   - **Purpose**: Retrieve all users for a specific branch
   - **Query Parameters**: 
     - `page`: Page number (default: 1)
     - `limit`: Items per page (default: 1000)
   - **Response Format**: 
     ```json
     {
       "users": [
         {
           "id": "user_id",
           "role": "user|customer|client|credit_officer",
           "branch": "branch_name",
           "createdAt": "2024-01-01T00:00:00Z",
           // ... other user fields
         }
       ],
       "total": 25
     }
     ```

## Data Processing Logic

### Customer Role Identification
The system identifies customers by filtering users with these roles:
- `user`
- `customer` 
- `client`

### Credit Officer Identification
Credit officers are identified by the role:
- `credit_officer`

### Error Handling
- **404 Errors**: If a branch has no users, returns count of 0
- **Network Errors**: Logs warning but continues with other branches
- **Invalid Response**: Falls back to 0 count for that branch

## Frontend Display

### Table Structure
```typescript
interface BranchRecord {
  id: string;
  branchId: string;    // Display format: "ID: BR001"
  name: string;        // Branch name
  cos: string;         // Credit officers count (as string)
  customers: number;   // Customer count (as number)
  dateCreated: string; // Creation date
}
```

### Table Column Configuration
```typescript
// In app/_components/ui/Table.tsx
case 'branches':
  return [
    { key: 'branchId', label: 'Branch ID', sortable: true },
    { key: 'name', label: 'Branch Name', sortable: true },
    { key: 'cos', label: 'Credit Officers', sortable: true },
    { key: 'customers', label: 'Customers', sortable: true }, // ← Customer count column
    { key: 'dateCreated', label: 'Date Created', sortable: true }
  ];
```

## Performance Considerations

### Batch Processing
- Fetches up to 1000 users per branch in a single request
- Uses `Promise.all()` to fetch user data for all branches concurrently
- Implements error isolation (one branch failure doesn't affect others)

### Caching Strategy
- No explicit caching implemented
- Data is refetched on page load and filter changes
- Could benefit from caching branch user counts

## Current Issues & Limitations

1. **Performance**: Makes N+1 API calls (1 for branches + 1 per branch for users)
2. **Scalability**: Fetches up to 1000 users per branch, may not scale for large branches
3. **Real-time Updates**: No real-time updates when users are added/removed
4. **Error Recovery**: Limited retry logic for failed requests

## Potential Improvements

1. **Backend Optimization**: Create a dedicated endpoint that returns branch statistics
   ```
   GET /admin/branches/statistics
   Response: [
     { branchName: "Osogbo", customerCount: 0, creditOfficerCount: 0 },
     { branchName: "Ede", customerCount: 0, creditOfficerCount: 0 }
   ]
   ```

2. **Caching**: Implement client-side caching with TTL
3. **Pagination**: Handle branches with more than 1000 users
4. **Real-time Updates**: WebSocket or polling for live updates
5. **Error Handling**: Implement retry logic with exponential backoff

## Summary

The customer count in the branch table is retrieved through a two-step process:
1. Fetch all branch names from `/users/branches`
2. For each branch, fetch all users from `/admin/users/branch/{branchName}` and count those with customer roles

This approach works but has performance implications due to the N+1 query pattern. The data is accurate and handles errors gracefully, but could benefit from backend optimization for better scalability.