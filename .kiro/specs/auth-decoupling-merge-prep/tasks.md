# Authentication Decoupling and Dashboard Integration - Implementation Tasks

## Overview
Based on analysis of the current vs feature branch, this implementation plan will:
1. Remove custom authentication system to align with main branch
2. Integrate AM dashboard with real backend data (like System Admin)
3. Ensure merge-safe integration with existing Branch Manager authentication

## Main Branch Analysis Summary

### ✅ What Exists in Main Branch
- **Authentication System**: Official AuthContext + js-cookie pattern
- **API Client**: Uses localStorage auth_session for Authorization header
- **Middleware**: Role-based routing with ACCOUNT_MANAGER → `/dashboard/am`
- **BM Dashboard**: Fully integrated with real backend using query hooks
- **Service Pattern**: Direct API calls with proper error handling and transformations

### ❌ What's Missing in Main Branch
- **AM Dashboard**: Directory `/dashboard/am` doesn't exist yet
- **AM Services**: No account manager specific services
- **AM Query Hooks**: No query hooks for AM dashboard data

### 🔄 What Needs Integration
- **AM Dashboard**: Currently uses mocked data via `unifiedDashboardService`
- **Custom Auth**: Feature branch has custom `authManager` that conflicts with main
- **Service Inconsistency**: Mixed patterns between unified services and direct API calls

## Implementation Tasks

### Phase 1: Authentication System Decoupling

#### Task 1.1: Remove Custom Authentication Components
**Priority**: High | **Estimated Time**: 30 minutes
**Requirements**: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6

**Files to Delete:**
- `lib/api/authManager.ts` _(Requirement 2.1)_
- `lib/services/auth.ts` _(Requirement 2.2)_
- `lib/services/authFix.ts` _(Requirement 2.3)_
- `AUTHENTICATION_FIX_INSTRUCTIONS.md` _(Requirement 2.4)_
- `app/_components/ui/AuthDebugPanel.tsx` _(Requirement 2.5)_
- `app/_components/ui/AuthTestPanel.tsx` _(Requirement 2.6)_

**Verification:**
```bash
# Ensure no references remain
grep -r "authManager\|authFix" --exclude-dir=node_modules .
```

#### Task 1.2: Update API Client to Use Official Auth Pattern
**Priority**: High | **Estimated Time**: 20 minutes
**Requirements**: 1.1, 1.4, 9.1

**File**: `lib/api/client.ts`

**Changes:**
- Remove `authManager` imports and usage _(Requirement 1.4)_
- Update `getDefaultHeaders()` to use `js-cookie` directly for token _(Requirements 1.1, 9.1)_
- Remove authentication failure handling that triggers custom auth fix _(Requirement 1.2)_
- Align with main branch `lib/apiClient.ts` pattern

**Before:**
```typescript
import { authManager } from './authManager';
// ... custom auth logic
```

**After:**
```typescript
import Cookies from 'js-cookie';
// Use localStorage auth_session like main branch
```

#### Task 1.3: Clean AuthContext Integration
**Priority**: High | **Estimated Time**: 15 minutes
**Requirements**: 1.3, 1.5, 9.3

**File**: `app/context/AuthContext.tsx`

**Changes:**
- Remove `authManager` imports and synchronization calls _(Requirement 1.5)_
- Ensure compatibility with main branch AuthContext pattern _(Requirement 1.3)_
- Remove any custom `setAuth`/`clearAuth` calls
- Use official AuthContext logout method _(Requirement 9.3)_

#### Task 1.4: Update Service Layer Authentication
**Priority**: Medium | **Estimated Time**: 30 minutes
**Requirements**: 3.1, 3.2, 3.3, 3.4

**Files:**
- `lib/services/activityLogs.ts` _(Requirement 3.1)_
- `lib/services/systemSettings.ts` _(Requirement 3.2)_
- `lib/services/userProfile.ts`
- `lib/services/reports.ts`

**Changes:**
- Remove `authManager` imports and "auto-fix" authentication logic _(Requirements 3.1, 3.2)_
- Rely on API client's built-in authentication headers _(Requirement 3.3)_
- Remove any manual token management _(Requirement 3.4)_

### Phase 2: AM Dashboard Backend Integration

#### Task 2.1: Verify Backend Endpoint Consistency
**Priority**: High | **Estimated Time**: 30 minutes

**Verification Tasks:**
- Compare AM and System Admin dashboard endpoints
- Verify both use identical backend endpoints for same data types
- Document any endpoint differences
- Ensure role-based filtering happens on backend

**Files to Compare:**
- `lib/services/systemAdmin.ts` (current)
- `lib/services/am.ts` (to be created)
- Backend API documentation

#### Task 2.2: Create AM Query Hooks (Mirror System Admin Pattern)
**Priority**: High | **Estimated Time**: 45 minutes
**Requirements**: 4.4, 4.6

**New File**: `app/dashboard/am/queries/useAMQueries.ts` _(Requirement 4.6)_

**Implementation:**
```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import { amService } from "@/lib/services/am";
import type { PaginatedResponse } from "@/lib/api/types";
import { AxiosError } from "axios";

export function useAMDisbursementsQuery(page: number = 1, limit: number = 10) {
  return useQuery<PaginatedResponse<DisbursementRecord>, AxiosError>({
    queryKey: ["am", "disbursements", page, limit],
    queryFn: () => amService.getDisbursements(page, limit),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

// Similar hooks for recollections, savings, missed-payments
```

**Note**: Creates query hooks identical to System Admin pattern _(Requirement 4.4)_

#### Task 2.2: Create AM Service (Mirror System Admin Pattern)
**Priority**: High | **Estimated Time**: 60 minutes
**Requirements**: 4.1, 5.1, 5.3

**New File**: `lib/services/am.ts`

**Implementation:**
- Copy `lib/services/systemAdmin.ts` structure
- Update query keys to use "am" prefix
- Use same API endpoints (AM and System Admin share same data) _(Requirement 4.1)_
- Implement same transformation methods _(Requirement 5.3)_
- Handle role-based filtering on backend
- Use unified services pattern _(Requirement 5.1)_

**Key Methods:**
```typescript
class AMAPIService {
  async getDisbursements(page: number, limit: number): Promise<PaginatedResponse<DisbursementRecord>>
  async getRecollections(page: number, limit: number): Promise<PaginatedResponse<RecollectionRecord>>
  async getSavings(page: number, limit: number): Promise<PaginatedResponse<SavingsRecord>>
  async getMissedPayments(page: number, limit: number): Promise<PaginatedResponse<MissedPaymentRecord>>
}
```

#### Task 2.3: Create AM Dashboard KPI Service
**Priority**: High | **Estimated Time**: 30 minutes
**Requirements**: 4.2, 4.3, 5.1

**New File**: `app/dashboard/am/queries/useAMDashboardQuery.ts`

**Implementation:**
- Mirror BM dashboard pattern: `app/dashboard/bm/queries/kpi/useDashboardQuery.ts`
- Use same dashboard service endpoints _(Requirement 4.2)_
- Use same branchPerformanceService.calculateBranchPerformance() _(Requirement 4.3)_
- Backend handles role-based data filtering
- Replace `unifiedDashboardService` usage _(Requirement 5.1)_

#### Task 2.4: Update AM Dashboard to Use Real Backend Data
**Priority**: High | **Estimated Time**: 90 minutes
**Requirements**: 4.5, 4.7, 4.8, 11.1, 11.2, 11.3, 11.4, 11.5

**File**: `app/dashboard/am/page.tsx`

**Changes:**
1. **Remove Mock Data Dependencies:**
   - Remove `unifiedDashboardService` import
   - Remove mock `tabData` state _(Requirement 4.5)_
   - Remove mock KPI transformations

2. **Add Real Query Hooks:**
   ```typescript
   import { useAMDashboardQuery } from './queries/useAMDashboardQuery';
   import { 
     useAMDisbursementsQuery,
     useAMRecollectionsQuery,
     useAMSavingsQuery,
     useAMMissedPaymentsQuery
   } from './queries/useAMQueries';
   ```

3. **Update Data Flow:**
   - Replace `fetchDashboardData()` with `useAMDashboardQuery()`
   - Replace tab data with real query results
   - Update loading/error states to use query states _(Requirements 11.2, 11.5)_
   - Remove mock data transformations

4. **Update Tab Data Handling:**
   ```typescript
   const getCurrentTabData = () => {
     switch (activeTab) {
       case 'disbursements':
         return {
           data: disbursementsData?.data || [],
           loading: disbursementsLoading,
           error: disbursementsError,
           pagination: disbursementsData?.pagination
         };
       // ... similar for other tabs
     }
   };
   ```

5. **Implement System Admin Fixes:**
   - Apply same error handling as System Admin _(Requirement 11.2)_
   - Implement same backend pagination _(Requirement 11.3)_
   - Add same search capabilities _(Requirement 11.4)_
   - Add same advanced filtering _(Requirement 11.5)_
   - Mirror System Admin fixes for data loading _(Requirement 4.7)_

#### Task 2.5: Update AM Settings Page Backend Integration
**Priority**: Medium | **Estimated Time**: 30 minutes
**Requirements**: 7.1, 7.2, 7.3, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6

**File**: `app/dashboard/am/settings/page.tsx`

**Changes:**
- Ensure `userProfileService` calls work with official auth
- Remove any custom auth dependencies
- Verify profile picture upload works
- Test password change functionality
- Use same backend endpoints as System Admin settings _(Requirements 7.1, 12.1)_
- Ensure identical functionality to System Admin settings _(Requirements 7.3, 12.2)_
- Use same systemSettingsService as System Admin _(Requirements 7.2, 12.3)_
- Implement same error handling and fallback logic _(Requirements 12.4, 12.5)_
- Ensure UI components are consistent _(Requirement 12.5)_
- Verify role-based permissions work correctly _(Requirement 12.6)_

### Phase 3: Service Layer Unification and Dashboard Parity

#### Task 3.1: Dashboard Implementation Parity Analysis
**Priority**: High | **Estimated Time**: 45 minutes

**Analysis Tasks:**
- Compare AM dashboard vs System Admin dashboard implementations
- Identify System Admin fixes missing from AM dashboard
- Document feature gaps between dashboards
- Ensure identical error handling patterns
- Ensure identical pagination logic
- Ensure identical search functionality
- Ensure identical filter functionality

**Files to Compare:**
- `app/dashboard/am/page.tsx`
- `app/dashboard/system-admin/page.tsx`
- `app/dashboard/am/settings/page.tsx`
- `app/dashboard/system-admin/settings/page.tsx`

#### Task 3.2: Settings Page Cross-Dashboard Verification
**Priority**: High | **Estimated Time**: 45 minutes

**Verification Tasks:**
- Compare AM settings vs System Admin settings implementations
- Ensure AM settings uses identical backend endpoints as System Admin
- Verify systemSettingsService usage consistency
- Ensure UI component consistency between dashboards
- Test settings API error handling and fallback logic
- Verify role-based permissions for settings access

**Files:**
- `app/dashboard/am/settings/page.tsx`
- `app/dashboard/system-admin/settings/page.tsx`
- `lib/services/systemSettings.ts`

#### Task 3.3: Remove Unified Dashboard Service Dependencies
**Priority**: Medium | **Estimated Time**: 20 minutes
**Requirements**: 5.2

**Files to Update:**
- Any remaining imports of `unifiedDashboardService`
- Replace with direct service calls or query hooks
- Ensure both dashboards share same data transformation and error handling logic _(Requirement 5.2)_

#### Task 3.2: Verify Settings Page Consistency
**Priority**: Medium | **Estimated Time**: 30 minutes
**Requirements**: 7.4, 11.6

**Comparison**: AM settings vs BM settings vs System Admin settings

**Files:**
- `app/dashboard/am/settings/page.tsx`
- `app/dashboard/bm/setting/page.tsx` (main branch)
- `app/dashboard/system-admin/settings/page.tsx`

**Ensure:**
- Same profile update endpoints
- Same password change flow
- Same profile picture upload
- Consistent UI/UX patterns
- Document any feature gaps between dashboards _(Requirement 11.6)_
- Ensure consistent error handling _(Requirement 7.4)_

### Phase 4: Verification and Testing

#### Task 4.1: Authentication Flow Testing
**Priority**: High | **Estimated Time**: 30 minutes
**Requirements**: 6.1, 6.2, 6.3, 6.4, 6.5, 9.2, 13.5

**Test Cases:**
1. Fresh login at `/auth/bm/login`
2. Role-based redirect to appropriate dashboard:
   - system_admin role → /dashboard/system-admin _(Requirement 6.1)_
   - account_manager role → /dashboard/am _(Requirement 6.2)_
   - branch_manager role → /dashboard/bm _(Requirement 6.3)_
3. Token persistence across page refreshes
4. Logout functionality _(Requirement 9.3)_
5. Protected route access
6. Middleware role conversion works correctly _(Requirement 6.4)_
7. Role-based routing logic maintained _(Requirement 6.5)_
8. Token expiration handling _(Requirement 9.2)_
9. Login flow works with role-based dashboard routing _(Requirement 13.5)_

#### Task 4.2: AM Dashboard Data Verification
**Priority**: High | **Estimated Time**: 45 minutes
**Requirements**: 8.1, 8.2, 8.3, 8.4, 11.7, 13.4

**Test Cases:**
1. KPI cards show real backend data
2. Tab navigation loads real data
3. Pagination works correctly
4. Search and filtering work
5. Error states display properly _(Requirements 8.1, 8.2)_
6. Loading states work correctly _(Requirements 8.3, 8.4)_
7. Loading states, empty states, and error states identical to System Admin _(Requirement 11.7)_
8. All existing functionality tests pass _(Requirement 13.4)_

#### Task 4.3: Cross-Dashboard Consistency Check
**Priority**: Medium | **Estimated Time**: 30 minutes
**Requirements**: 4.1, 5.4, 8.4, 13.4

**Verification:**
1. AM and System Admin dashboards show same data for same endpoints _(Requirement 4.1)_
2. Settings pages have identical functionality _(Requirement 5.4)_
3. Authentication behavior is consistent
4. Error handling patterns match
5. Data transformation logic produces consistent formats _(Requirement 8.4)_
6. All existing functionality tests pass for both dashboards _(Requirement 13.4)_

#### Task 4.4: Merge Conflict Prevention
**Priority**: High | **Estimated Time**: 20 minutes
**Requirements**: 13.1, 13.2, 13.3

**Checks:**
1. No custom auth files remain
2. All services use official auth pattern
3. API client matches main branch pattern
4. No conflicting middleware changes
5. Role routing works correctly
6. Application compiles without TypeScript errors _(Requirement 13.1)_
7. Application runs without referencing deleted authentication files _(Requirement 13.2)_
8. Session state maintained correctly between dashboards _(Requirement 13.3)_

## Success Criteria

### ✅ Authentication Decoupling Complete
- [ ] All custom auth components removed
- [ ] API client uses official auth pattern
- [ ] AuthContext aligned with main branch
- [ ] Services use standard authentication

### ✅ AM Dashboard Backend Integration Complete
- [ ] AM dashboard uses real backend data
- [ ] Query hooks implemented following BM pattern
- [ ] AM service layer created
- [ ] No mocked data remains
- [ ] Error handling implemented

### ✅ Merge Safety Achieved
- [ ] No authentication conflicts with main branch
- [ ] AM dashboard ready for main branch integration
- [ ] Settings pages consistent across dashboards
- [ ] All tests pass

### ✅ Feature Parity Maintained
- [ ] AM dashboard functionality preserved
- [ ] System Admin dashboard functionality preserved
- [ ] All user roles work correctly
- [ ] Performance maintained

## Risk Mitigation

### Authentication Risks
- **Risk**: Breaking existing auth flow
- **Mitigation**: Test each auth change incrementally
- **Rollback**: Keep auth changes in separate commits

### Data Integration Risks
- **Risk**: Backend API changes breaking AM dashboard
- **Mitigation**: Use same endpoints as System Admin (proven working)
- **Rollback**: Maintain service layer abstraction

### Merge Conflict Risks
- **Risk**: Conflicts with main branch authentication
- **Mitigation**: Align exactly with main branch patterns
- **Rollback**: Feature branch backup before changes

## Additional Requirements Coverage

### Missing Task: LoginForm Authentication Update
**Requirement 1, Criteria 6**: Remove authManager from LoginForm.tsx

**New Task 1.5: Update LoginForm Authentication**
- **Priority**: High | **Estimated Time**: 10 minutes
- **Files**: Any LoginForm components that import `authManager`
- **Changes**: Remove `authManager` imports and usage, remove redundant token synchronization

### Missing Task: Backend Endpoint Verification  
**Requirement 4, Criteria 1-2**: Verify identical backend endpoints and services

**New Task 2.1: Backend Endpoint Consistency Verification**
- **Priority**: High | **Estimated Time**: 30 minutes
- **Tasks**: Compare AM and System Admin endpoints, verify accurateDashboardService usage

### Missing Task: Unified Service Pattern Verification
**Requirement 5**: Ensure unified service pattern consistency

**New Task 3.4: Unified Service Pattern Verification**
- **Priority**: Medium | **Estimated Time**: 30 minutes
- **Tasks**: Verify unified services usage across both dashboards

### Missing Task: Dashboard Parity Analysis
**Requirement 11**: Complete dashboard implementation parity analysis

**New Task 3.1: Dashboard Implementation Parity Analysis**
- **Priority**: High | **Estimated Time**: 45 minutes
- **Tasks**: Compare implementations, identify missing fixes, document feature gaps

### Missing Task: Settings Cross-Dashboard Verification
**Requirement 12**: Detailed settings page verification

**New Task 3.2: Settings Page Cross-Dashboard Verification**
- **Priority**: High | **Estimated Time**: 45 minutes
- **Tasks**: Compare settings implementations, verify systemSettingsService usage

## Updated Estimated Total Time: 8-10 hours

**Critical Path with Additional Tasks:**
1. Authentication decoupling (2 hours)
2. AM backend integration (3.5 hours)
3. Dashboard parity and verification (2.5 hours)
4. Final testing and merge preparation (2 hours)