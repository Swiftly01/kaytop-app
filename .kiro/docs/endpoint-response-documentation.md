# Branch Creation API Endpoint - Investigation Results

## 🚨 CRITICAL FINDING: ENDPOINT NOT IMPLEMENTED

**Date**: January 28, 2025  
**Status**: ❌ **ENDPOINT NOT AVAILABLE**  
**URL**: `POST /admin/branches`  
**Response**: `404 Not Found`

## Investigation Summary

### ✅ What We Tested
- Authentication with System Admin credentials ✅
- GET /admin/branches → 404 Not Found ❌
- POST /admin/branches → 404 Not Found ❌
- Alternative paths (/branches, /admin/branch) → All 404 ❌

### ✅ What Works
- `GET /users/branches` → Returns array of branch names ✅
- `GET /admin/users` → Returns users with branch field ✅
- `GET /dashboard/kpi` → Returns branch-related statistics ✅

### 🔍 Discrepancy Found
The `.postman.json` file claims:
```json
"✅ Create Branch - AVAILABLE (POST /admin/branches)"
```
**Reality**: This endpoint returns 404 Not Found

## Current Branch Architecture

Branches currently exist as:
1. **User attributes**: Each user has a `branch` field
2. **Branch list**: Available via `GET /users/branches`
3. **No CRUD operations**: Cannot create/update/delete branches

### Existing Branches in System
- Head Office, Lagos Island, Ibadan Branch, Lagos Central
- Ilaro, Osogbo, Ede, Ikire, Ado-Ekiti, Offa, Ilorin, Akure, Abeokuta

## Frontend Implementation Status

### ✅ Code Ready
The frontend has complete implementation:
```typescript
// lib/services/branches.ts - READY
async createBranch(data: CreateBranchData): Promise<Branch>

// Interfaces defined - READY
interface CreateBranchData {
  name: string;
  code: string; 
  address: string;
  state: string;
  region: string;
  // ... optional fields
}
```

### ❌ Backend Missing
- No `POST /admin/branches` endpoint
- No branch CRUD operations
- Frontend will fail at runtime

## Recommendations

### Immediate Actions
1. **Backend Team**: Implement `POST /admin/branches` endpoint
2. **Frontend Team**: Add endpoint availability check and graceful degradation
3. **Testing**: Re-run tests once backend is implemented

### Backend Requirements
```typescript
// Endpoints needed:
POST /admin/branches    // Create branch
GET /admin/branches     // List branches  
GET /admin/branches/{id} // Get branch
PATCH /admin/branches/{id} // Update branch
DELETE /admin/branches/{id} // Delete branch
```

## Testing Resources Created

Despite endpoint unavailability, comprehensive testing resources are ready:
- Complete test suites (18 scenarios)
- API documentation with TypeScript interfaces
- Manual testing procedures
- Error handling patterns

**Status**: Ready for implementation and testing once backend endpoint is available.

---

# User Management Endpoints - Response Structure Documentation

## Testing Results - Updated 2026-01-26

### 1. GET /admin/users/{id}
**Status**: ✅ Working
**Response Structure**:
```json
{
  "id": 7,
  "firstName": "Branch",
  "lastName": "Manager",
  "email": "lagos_branch@mailsac.com",
  "mobileNumber": "09131365115",
  "role": "branch_manager",
  "branch": "Lagos Island",
  "state": "Lagos",
  "accountStatus": "fully_verified",
  "isVerified": true,
  "verificationStatus": "verified",
  "profilePicture": "https://res.cloudinary.com/dykhextof/image/upload/v1767504989/qnqdu5xdubllgh8iqyox.png",
  "address": null,
  "dob": null,
  "idNumber": null,
  "idPicture": null,
  "idType": null,
  "guarantorName": null,
  "guarantorEmail": null,
  "guarantorPhone": null,
  "guarantorAddress": null,
  "guarantorPicture": null,
  "createdAt": "2025-11-29T11:42:51.682Z",
  "createdAtBy": "2025-11-29T12:42:09.495Z",
  "updatedAt": null,
  "verifiedAt": null
}
```

### 2. PATCH /admin/users/{id}/update-role
**Status**: ❌ DEPRECATED - Returns 404 Not Found
**Request Body**: `{"role": "hq_manager"}`
**Error Response**:
```json
{
  "message": "Cannot PATCH /admin/users/{id}/update-role",
  "error": "Not Found",
  "statusCode": 404
}
```
**Note**: This endpoint is not available. Use the general user update endpoint instead.

### 3. PATCH /admin/users/{id} (with role) ✅ RECOMMENDED
**Status**: ✅ Working - TESTED AND CONFIRMED
**Request Body**: `{"role": "branch_manager"}`
**Response Structure**:
```json
{
  "id": 7,
  "firstName": "Branch",
  "lastName": "Manager",
  "email": "lagos_branch@mailsac.com",
  "mobileNumber": "09131365115",
  "role": "branch_manager",
  "branch": "Lagos Island",
  "state": "Lagos",
  "accountStatus": "fully_verified",
  "isVerified": true,
  "verificationStatus": "verified",
  "profilePicture": "https://res.cloudinary.com/dykhextof/image/upload/v1767504989/qnqdu5xdubllgh8iqyox.png",
  "address": null,
  "dob": null,
  "idNumber": null,
  "idPicture": null,
  "idType": null,
  "guarantorName": null,
  "guarantorEmail": null,
  "guarantorPhone": null,
  "guarantorAddress": null,
  "guarantorPicture": null,
  "createdAt": "2025-11-29T11:42:51.682Z",
  "createdAtBy": "2025-11-29T12:42:09.495Z",
  "updatedAt": null,
  "verifiedAt": null
}
```

### 4. PATCH /admin/users/{id} (with profile data)
**Status**: ✅ Expected to work (same endpoint as role update)
**Request Body**: `{"firstName": "Test", "lastName": "User Updated", "email": "test@example.com"}`
**Response Structure**:
```json
// Same structure as above with updated fields
```

### 5. PATCH /admin/users/{id} (with mixed data)
**Status**: ✅ Expected to work (same endpoint as role update)
**Request Body**: `{"firstName": "Mixed", "lastName": "Update", "email": "mixed@example.com", "role": "branch_manager"}`
**Response Structure**:
```json
// Same structure as above with updated fields
```

### 6. PATCH /users/me
**Status**: ⚠️ Not tested yet
**Request Body**: `{"firstName": "System", "lastName": "Admin Updated"}`
**Response Structure**:
```json
// To be tested
```

## Frontend Implementation Guidelines

### ✅ Use This Endpoint for Role Updates:
- **Method**: `PATCH`
- **URL**: `/admin/users/{id}`
- **Body**: `{ "role": "new_role" }`
- **Response**: Complete user object with updated role

### ❌ Do NOT Use:
- **URL**: `/admin/users/{id}/update-role` (Returns 404)

### Response Handling:
1. Response returns the complete user object
2. Extract the updated user data directly from response
3. Update frontend state with the returned user object
4. Check `response.role` to confirm the role was updated

### Error Handling:
- **404**: User not found or endpoint not available
- **400**: Invalid role or request data
- **403**: Insufficient permissions
- **401**: Authentication required

### 7. POST /admin/staff/create
**Status**: 
**Request Body**: `{"firstName": "Test", "lastName": "Staff", "email": "test@example.com", ...}`
**Response Structure**:
```json
// Paste actual response here
```

### 8. GET /admin/users (list)
**Status**: 
**Response Structure**:
```json
// Paste actual response here
```

## Summary of Findings

### Working Endpoints:
- [ ] PATCH /admin/users/{id}/update-role
- [ ] PATCH /admin/users/{id}
- [ ] PATCH /users/me
- [ ] POST /admin/staff/create
- [ ] GET /admin/users/{id}
- [ ] GET /admin/users

### Response Format Patterns:
1. **Direct Format**: `{id: 1, firstName: "John", ...}`
2. **Wrapped Format**: `{success: true, data: {id: 1, firstName: "John", ...}}`
3. **Nested Format**: `{data: {success: true, data: {id: 1, firstName: "John", ...}}}`
4. **Array Format**: `[{id: 1, firstName: "John", ...}]`

### Field Name Mappings:
- **Name**: `firstName` + `lastName` vs `name`
- **Phone**: `mobileNumber` vs `phone`
- **ID**: `string` vs `number`

### Error Response Format:
```json
// Document actual error response structure
```

## Recommendations Based on Testing:
1. Use endpoint X for role updates
2. Use endpoint Y for profile updates
3. Handle response format Z for all user operations
4. Implement fallback logic for endpoints that return 404