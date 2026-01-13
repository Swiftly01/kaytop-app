# Requirements Document

## Introduction

This specification defines the requirements for decoupling custom authentication components from the System Admin and Account Manager dashboards to ensure seamless integration with the main branch. The goal is to remove merge conflicts by aligning with the official Branch Manager authentication system while maintaining full functionality of both dashboard systems.

## Glossary

- **Custom_Auth_System**: The custom authentication manager and related utilities added during System Admin development
- **Official_Auth_System**: The Branch Manager's authentication system using AuthContext and js-cookie
- **System_Admin_Dashboard**: The system administrator dashboard and related pages
- **Account_Manager_Dashboard**: The account manager dashboard and related pages  
- **Unified_Services**: Backend integration services using the "unified" naming pattern
- **Backend_Integration**: Real API endpoints replacing mocked data

## Requirements

### Requirement 1: Authentication System Decoupling

**User Story:** As a developer preparing for merge, I want to remove custom authentication components, so that the codebase integrates cleanly with the main branch authentication system.

#### Acceptance Criteria

1. WHEN the API client makes requests, THE System SHALL use js-cookie to fetch tokens directly instead of authenticationManager
2. WHEN authentication fails, THE System SHALL rely on the official AuthContext error handling instead of custom auth fixes
3. WHEN users log in, THE System SHALL use only the official LoginForm and AuthContext without custom synchronization
4. THE System SHALL remove all authenticationManager imports and usage from client.ts
5. THE System SHALL remove all authenticationManager imports and usage from AuthContext.tsx
6. THE System SHALL remove all authenticationManager imports and usage from LoginForm.tsx

### Requirement 2: Custom Authentication Component Removal

**User Story:** As a developer preparing for merge, I want to delete redundant authentication files, so that there are no conflicting authentication implementations.

#### Acceptance Criteria

1. THE System SHALL delete the authManager.ts file completely
2. THE System SHALL delete the auth.ts service file completely  
3. THE System SHALL delete the authFix.ts utility file completely
4. THE System SHALL delete the AUTHENTICATION_FIX_INSTRUCTIONS.md documentation file completely
5. THE System SHALL delete the AuthDebugPanel.tsx component completely
6. THE System SHALL delete the AuthTestPanel.tsx component completely

### Requirement 3: Service Layer Authentication Cleanup

**User Story:** As a developer preparing for merge, I want to remove custom authentication logic from services, so that services use the official authentication system consistently.

#### Acceptance Criteria

1. WHEN activityLogs.ts makes API calls, THE System SHALL remove authenticationManager imports and auto-fix authentication logic
2. WHEN systemSettings.ts makes API calls, THE System SHALL remove authenticationManager imports and auto-fix authentication logic  
3. WHEN services encounter authentication errors, THE System SHALL rely on the unified API client's built-in error handling
4. THE System SHALL ensure all services use the official token management through js-cookie

### Requirement 4: Account Manager Dashboard Backend Integration Verification

**User Story:** As an account manager, I want my dashboard to use real backend data identical to System Admin, so that I can see accurate information instead of mocked data.

#### Acceptance Criteria

1. WHEN comparing AM and System Admin dashboards, THE System SHALL verify both use identical backend endpoints for the same data types
2. WHEN the AM dashboard loads KPIs, THE System SHALL use the same accurateDashboardService.getAccurateKPIs() as System Admin
3. WHEN the AM dashboard displays branch performance, THE System SHALL use the same branchPerformanceService.calculateBranchPerformance() as System Admin
4. WHEN the AM dashboard shows tabular data, THE System SHALL create and use query hooks (useDisbursementsQuery, useRecollectionsQuery, useSavingsQuery, useMissedPaymentsQuery) identical to System Admin
5. THE System SHALL remove all mocked tabData arrays from AM dashboard main page and replace with real backend queries
6. THE System SHALL create app/dashboard/am/queries/useAMQueries.ts file mirroring System Admin query patterns
7. THE System SHALL ensure AM dashboard pages mirror System Admin fixes for data loading, error handling, and pagination
8. THE System SHALL verify AM dashboard uses unified services pattern (unifiedDashboard, unifiedUser, unifiedLoan, unifiedSavings) consistently

### Requirement 5: Unified Service Pattern Consistency

**User Story:** As a developer, I want consistent service patterns across dashboards, so that maintenance and development are streamlined.

#### Acceptance Criteria

1. WHEN AM dashboard needs data, THE System SHALL use unified services (unifiedDashboard, unifiedUser, unifiedLoan, unifiedSavings)
2. WHEN System Admin dashboard needs data, THE System SHALL continue using the same unified service pattern
3. THE System SHALL ensure both dashboards share the same data transformation and error handling logic
4. THE System SHALL maintain the same API endpoint usage patterns across both dashboard types

### Requirement 6: Role-Based Access Control Verification

**User Story:** As a system administrator, I want proper role-based access control, so that users can only access dashboards appropriate to their roles.

#### Acceptance Criteria

1. WHEN a user with system_admin role logs in, THE System SHALL redirect to /dashboard/system-admin
2. WHEN a user with account_manager role logs in, THE System SHALL redirect to /dashboard/am  
3. WHEN a user with branch_manager role logs in, THE System SHALL redirect to /dashboard/bm
4. THE System SHALL ensure middleware properly handles role conversion from API format to middleware format
5. THE System SHALL maintain existing role-based routing logic without modification

### Requirement 7: Settings Page Integration

**User Story:** As an administrator, I want settings pages to work consistently across all dashboard types, so that system configuration is unified.

#### Acceptance Criteria

1. WHEN accessing AM dashboard settings, THE System SHALL use the same backend endpoints as System Admin settings
2. WHEN updating settings from AM dashboard, THE System SHALL persist changes using the same API calls as System Admin
3. THE System SHALL ensure settings page functionality is identical between AM and System Admin dashboards
4. THE System SHALL handle settings API errors gracefully with fallback to default values

### Requirement 8: Data Consistency and Error Handling

**User Story:** As a user, I want consistent data display and error handling, so that the application behaves predictably across all dashboards.

#### Acceptance Criteria

1. WHEN backend endpoints are unavailable, THE System SHALL display appropriate error messages and fallback data
2. WHEN API calls fail, THE System SHALL use the same error handling patterns across AM and System Admin dashboards
3. WHEN data is loading, THE System SHALL show consistent loading states across both dashboard types
4. THE System SHALL ensure data transformation logic produces consistent formats for both dashboards

### Requirement 9: Authentication Token Management

**User Story:** As a developer, I want simplified token management, so that authentication is handled consistently through the official system.

#### Acceptance Criteria

1. WHEN making API requests, THE System SHALL retrieve tokens using js-cookie.get('token') directly
2. WHEN tokens expire, THE System SHALL rely on middleware redirect logic instead of custom authentication fixes
3. WHEN users log out, THE System SHALL use the official AuthContext logout method
4. THE System SHALL remove all custom token storage and retrieval logic

### Requirement 11: Dashboard Implementation Parity Analysis

**User Story:** As a developer, I want to understand the differences between AM and System Admin dashboard implementations, so that I can ensure feature parity and consistent user experience.

#### Acceptance Criteria

1. WHEN analyzing dashboard components, THE System SHALL identify which System Admin fixes are missing from AM dashboard
2. WHEN comparing data loading patterns, THE System SHALL ensure AM dashboard uses the same error handling as System Admin
3. WHEN reviewing pagination logic, THE System SHALL ensure AM dashboard implements the same backend pagination as System Admin
4. WHEN examining search functionality, THE System SHALL ensure AM dashboard has the same search capabilities as System Admin
5. WHEN checking filter functionality, THE System SHALL ensure AM dashboard supports the same advanced filtering as System Admin
6. THE System SHALL document any feature gaps between AM and System Admin dashboards
7. THE System SHALL ensure both dashboards handle loading states, empty states, and error states identically

### Requirement 12: Settings Page Cross-Dashboard Verification

**User Story:** As an administrator, I want settings functionality to be identical across AM and System Admin dashboards, so that system configuration is consistent regardless of user role.

#### Acceptance Criteria

1. WHEN accessing settings from AM dashboard, THE System SHALL use identical backend endpoints as System Admin settings
2. WHEN comparing settings page implementations, THE System SHALL ensure AM settings has all features present in System Admin settings
3. WHEN updating global settings from AM dashboard, THE System SHALL persist changes using the same systemSettingsService as System Admin
4. WHEN handling settings API errors, THE System SHALL use the same fallback logic and error messages as System Admin
5. THE System SHALL ensure settings page UI components are consistent between AM and System Admin dashboards
6. THE System SHALL verify role-based permissions for settings access work correctly for both dashboard types

### Requirement 13: Compilation and Runtime Verification

**User Story:** As a developer, I want the application to compile and run without errors, so that the merge preparation is successful.

#### Acceptance Criteria

1. WHEN the application compiles, THE System SHALL complete without TypeScript errors
2. WHEN the application runs, THE System SHALL not reference any deleted authentication files
3. WHEN users navigate between dashboards, THE System SHALL maintain session state correctly
4. THE System SHALL pass all existing functionality tests for both AM and System Admin dashboards
5. THE System SHALL verify that login flow works correctly with role-based dashboard routing