# Branch Creation API Documentation

## Endpoint Information

**URL**: `POST /admin/branches`  
**Authentication**: Required (Bearer token)  
**Permission Level**: System Admin  
**Content-Type**: `application/json`

## Request Structure

### TypeScript Interface

```typescript
export interface CreateBranchData {
  name: string;           // Required - Branch display name
  code: string;           // Required - Unique branch identifier
  address: string;        // Required - Physical address
  state: string;          // Required - State/Province
  region: string;         // Required - Region/Area
  managerId?: string;     // Optional - Manager user ID
  phone?: string;         // Optional - Branch contact number
  email?: string;         // Optional - Branch contact email
}
```

### Example Request Body

#### Minimal Required Fields
```json
{
  "name": "Lagos Main Branch",
  "code": "LMB001",
  "address": "123 Victoria Island, Lagos",
  "state": "Lagos",
  "region": "Lagos State"
}
```

#### Complete Request with Optional Fields
```json
{
  "name": "Lagos Main Branch",
  "code": "LMB001", 
  "address": "123 Victoria Island, Lagos",
  "state": "Lagos",
  "region": "Lagos State",
  "managerId": "7",
  "phone": "08012345678",
  "email": "lagosMain@kaytop.com"
}
```

## Response Structure

### Success Response (201 Created)

```typescript
export interface Branch {
  id: string;             // Generated branch ID
  name: string;           // Branch display name
  code: string;           // Unique branch code
  address: string;        // Physical address
  state: string;          // State/Province
  region: string;         // Region/Area
  manager?: string;       // Manager name (if assigned)
  managerId?: string;     // Manager user ID
  phone?: string;         // Contact phone
  email?: string;         // Contact email
  status: 'active' | 'inactive';  // Branch status
  dateCreated: string;    // ISO date string
  createdAt: string;      // ISO date string
  updatedAt: string;      // ISO date string
}
```

#### Example Success Response
```json
{
  "id": "lagos-main-branch",
  "name": "Lagos Main Branch",
  "code": "LMB001",
  "address": "123 Victoria Island, Lagos",
  "state": "Lagos", 
  "region": "Lagos State",
  "manager": "John Doe",
  "managerId": "7",
  "phone": "08012345678",
  "email": "lagosMain@kaytop.com",
  "status": "active",
  "dateCreated": "2024-01-28T10:30:00.000Z",
  "createdAt": "2024-01-28T10:30:00.000Z",
  "updatedAt": "2024-01-28T10:30:00.000Z"
}
```

### Error Response (400 Bad Request)

```typescript
export interface BranchCreationError {
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
```

#### Example Error Response
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Branch name is required"
    },
    {
      "field": "code", 
      "message": "Branch code must be unique"
    }
  ]
}
```

## HTTP Status Codes

| Code | Description | Scenario |
|------|-------------|----------|
| 201 | Created | Branch created successfully |
| 400 | Bad Request | Validation errors, missing required fields |
| 401 | Unauthorized | Invalid or missing authentication token |
| 403 | Forbidden | User doesn't have permission to create branches |
| 409 | Conflict | Duplicate branch code or name |
| 500 | Internal Server Error | Server-side error during creation |

## Validation Rules

### Required Fields
- **name**: Must be non-empty string
- **code**: Must be unique across all branches
- **address**: Must be non-empty string
- **state**: Must be valid state name
- **region**: Must be non-empty string

### Optional Fields
- **managerId**: Must reference existing user ID
- **phone**: Must be valid phone number format (if provided)
- **email**: Must be valid email format (if provided)

### Field Constraints
- **name**: Max length likely 100 characters
- **code**: Max length likely 20 characters, alphanumeric + special chars
- **address**: Max length likely 255 characters
- **phone**: Standard phone number format
- **email**: Standard email format validation

## Frontend Integration

### Service Method Implementation

```typescript
import { apiClient } from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/lib/api/config';

export class BranchService {
  async createBranch(data: CreateBranchData): Promise<Branch> {
    try {
      const response = await apiClient.post<Branch>(
        API_ENDPOINTS.ADMIN.BRANCHES, // '/admin/branches'
        data
      );
      
      if (response.status === 201) {
        return response.data;
      }
      
      throw new Error('Failed to create branch');
    } catch (error) {
      if (error.response?.status === 400) {
        throw new BranchValidationError(error.response.data);
      }
      throw error;
    }
  }
}
```

### React Hook Usage

```typescript
import { useMutation } from '@tanstack/react-query';
import { branchService } from '@/lib/services/branches';

export function useCreateBranch() {
  return useMutation({
    mutationFn: (data: CreateBranchData) => branchService.createBranch(data),
    onSuccess: (newBranch) => {
      toast.success(`Branch "${newBranch.name}" created successfully`);
      // Invalidate branches query to refresh list
      queryClient.invalidateQueries(['branches']);
    },
    onError: (error: BranchValidationError) => {
      toast.error(error.message);
      // Handle validation errors in form
    }
  });
}
```

### Form Validation

```typescript
import { z } from 'zod';

export const createBranchSchema = z.object({
  name: z.string().min(1, 'Branch name is required').max(100),
  code: z.string().min(1, 'Branch code is required').max(20),
  address: z.string().min(1, 'Address is required').max(255),
  state: z.string().min(1, 'State is required'),
  region: z.string().min(1, 'Region is required'),
  managerId: z.string().optional(),
  phone: z.string().regex(/^[\d\+\-\(\)\s]+$/, 'Invalid phone format').optional(),
  email: z.string().email('Invalid email format').optional(),
});

export type CreateBranchFormData = z.infer<typeof createBranchSchema>;
```

## Testing Checklist

### ✅ Test Cases to Verify

1. **Successful Creation**
   - [ ] Minimal required fields only
   - [ ] All fields including optional ones
   - [ ] Different states and regions

2. **Validation Testing**
   - [ ] Missing required fields (name, code, address, state, region)
   - [ ] Empty string values
   - [ ] Invalid email format
   - [ ] Invalid phone format
   - [ ] Duplicate branch codes

3. **Edge Cases**
   - [ ] Special characters in names
   - [ ] Very long field values
   - [ ] Unicode characters
   - [ ] SQL injection attempts

4. **Authentication & Authorization**
   - [ ] No authentication token
   - [ ] Invalid authentication token
   - [ ] Non-admin user attempting creation

5. **Response Verification**
   - [ ] Correct HTTP status codes
   - [ ] Response structure matches interface
   - [ ] All fields populated correctly
   - [ ] Generated ID format

## Common Issues & Solutions

### Issue: 401 Unauthorized
**Solution**: Ensure valid Bearer token is included in Authorization header

### Issue: 400 Bad Request - "Branch code already exists"
**Solution**: Use unique branch codes, implement code generation logic

### Issue: 403 Forbidden
**Solution**: Ensure user has system_admin role permissions

### Issue: Validation errors not showing in UI
**Solution**: Properly handle error response structure in frontend

## Related Endpoints

- `GET /admin/branches` - List all branches
- `GET /admin/branches/{id}` - Get specific branch
- `PATCH /admin/branches/{id}` - Update branch
- `DELETE /admin/branches/{id}` - Delete branch
- `GET /users/branches` - Get branch names (for dropdowns)

## Notes

- Branch creation is restricted to System Admin users only
- Branch codes must be unique across the entire system
- Created branches are automatically set to 'active' status
- The `id` field is auto-generated based on branch name (kebab-case)
- Manager assignment is optional during creation, can be updated later

---

**Last Updated**: January 28, 2025  
**API Version**: v1  
**Base URL**: `https://kaytop-production.up.railway.app`