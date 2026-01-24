# Implementation Plan: HQ Dashboard Enhancements

## Overview

This implementation plan transforms the approved design into actionable development tasks for the Kaytop HQ Dashboard enhancements. The plan focuses on extending existing components and services while maintaining consistency with current UI patterns and API integration approaches.

## Tasks

- [x] 1. Set up enhanced API services and types
  - Create ratings service with TypeScript interfaces
  - Extend reports service with HQ review methods
  - Add new API endpoints to configuration
  - _Requirements: 2.4, 2.5, 2.7, 3.3, 5.1_

- [x] 1.1 Write property test for API service integration
  - **Property 2: API Authentication Headers**
  - **Validates: Requirements 3.3**

- [x] 1.2 Write property test for backend enum compliance
  - **Property 3: Backend Enum Compliance**
  - **Validates: Requirements 5.1**

- [x] 2. Implement enhanced Reports page with branch aggregates view
  - [x] 2.1 Add view toggle component to Reports page
    - Create toggle between "Individual Reports" and "Branch Aggregates"
    - Implement state management for view switching
    - _Requirements: 1.1_

  - [x] 2.2 Create BranchAggregateTable component
    - Build specialized table for branch-level data
    - Replace "Credit Officer" column with "Branch Name" column
    - Implement sorting and selection functionality
    - _Requirements: 1.2, 4.3_

  - [x] 2.3 Implement branch aggregate data fetching
    - Fetch data using GET /reports/branch/{branchName} for each branch
    - Transform individual reports into branch aggregates
    - Handle pagination and filtering
    - _Requirements: 1.3, 5.2_

  - [x] 2.4 Write property test for data transformation
    - **Property 5: Data Transformation Consistency**
    - **Validates: Requirements 5.3**

  - [x] 2.5 Create HQ Review Modal component
    - Build detailed review interface with report information
    - Add "Approve" and "Reject" buttons with confirmation
    - Implement modal state management
    - _Requirements: 1.4, 1.5, 7.1_

  - [x] 2.6 Write property test for report detail completeness
    - **Property 8: Report Detail Completeness**
    - **Validates: Requirements 7.1**

- [x] 3. Implement HQ review workflow functionality
  - [x] 3.1 Add HQ review API methods to reports service
    - Implement PUT /reports/{id}/hq-review with action: "APPROVE"/"DECLINE"
    - Handle success and error responses
    - Add proper error handling and retry logic
    - _Requirements: 1.6, 1.7_

  - [x] 3.2 Implement approval/rejection handlers
    - Create approval handler with remarks
    - Create rejection handler with decline reason
    - Add optimistic UI updates
    - _Requirements: 1.6, 1.7_

  - [x] 3.3 Write property test for role-based access control
    - **Property 1: Role-based Access Control**
    - **Validates: Requirements 3.1, 3.2**

  - [x] 3.4 Write property test for authorization consistency
    - **Property 10: Authorization Consistency**
    - **Validates: Requirements 3.2**

- [x] 4. Checkpoint - Ensure reports enhancement tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement branch performance leaderboard system
  - [x] 5.1 Add Leaderboard tab to Branches page
    - Create tab navigation component
    - Implement tab switching state management
    - Position tab next to "Branches" section header
    - _Requirements: 2.1_

  - [x] 5.2 Create performance-focused statistics cards
    - Replace standard stat cards with performance cards
    - Implement "Top by Savings", "Top by Loan Disbursement", "Top by Loan Repayment"
    - Use existing StatisticsCard component patterns
    - _Requirements: 2.2, 4.2_

  - [x] 5.3 Implement ratings calculation functionality
    - Add "Calculate Ratings" button near Filters
    - Implement GET /ratings/calculate?period=DAILY&periodDate={date}
    - Handle calculation progress and results
    - _Requirements: 2.3, 2.4_

  - [x] 5.4 Write property test for rating period support
    - **Property 6: Rating Period Support**
    - **Validates: Requirements 6.1**

- [x] 6. Create leaderboard table and filtering
  - [x] 6.1 Build PerformanceLeaderboard component
    - Create leaderboard table using existing Table patterns
    - Implement ranking display with performance metrics
    - Add responsive design for mobile/desktop
    - _Requirements: 2.5, 4.3_

  - [x] 6.2 Implement leaderboard filtering controls
    - Add dropdown for type (MONEY_DISBURSED, LOAN_REPAYMENT, SAVINGS)
    - Add dropdown for period (DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY)
    - Implement filter state management
    - _Requirements: 2.6_

  - [x] 6.3 Integrate branch search with ratings
    - Extend existing search to use GET /ratings/branch/{name}
    - Display performance data in search results
    - Maintain existing search UI patterns
    - _Requirements: 2.7_

  - [x] 6.4 Write property test for performance metrics display
    - **Property 7: Performance Metrics Display**
    - **Validates: Requirements 6.2**

  - [x] 6.5 Write property test for search functionality
    - **Property 9: Search Functionality**
    - **Validates: Requirements 8.1**

- [x] 7. Implement ratings service and API integration
  - [x] 7.1 Create ratings service class
    - Implement calculateRatings, getLeaderboard, getBranchRating methods
    - Add proper TypeScript interfaces and error handling
    - Use existing API client infrastructure
    - _Requirements: 2.4, 2.5, 2.7_

  - [x] 7.2 Add ratings API endpoints to configuration
    - Add all ratings endpoints to API_ENDPOINTS configuration
    - Ensure proper URL construction and parameter handling
    - _Requirements: 2.4, 2.5, 2.7_

  - [x] 7.3 Write property test for response structure handling
    - **Property 4: Response Structure Handling**
    - **Validates: Requirements 5.2**

- [x] 8. Implement UI consistency and authentication
  - [x] 8.1 Ensure UI pattern consistency
    - Verify all new components follow existing sidebar navigation
    - Apply consistent styling for cards, tables, and filters
    - Use existing color schemes and typography
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 8.2 Implement role-based access control
    - Add HQ manager role verification for enhanced features
    - Implement access denial and redirection for unauthorized users
    - Use existing authentication infrastructure
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 8.3 Add error handling and loading states
    - Implement comprehensive error handling following existing patterns
    - Add loading skeletons for new components
    - Create fallback states for failed API calls
    - _Requirements: 6.3_

- [x] 8.4 Write integration tests for complete workflows
  - Test end-to-end report review workflow
  - Test complete leaderboard calculation and display
  - _Requirements: 1.1-1.7, 2.1-2.7_

- [x] 9. Final integration and testing
  - [x] 9.1 Wire all components together
    - Integrate enhanced Reports page with existing navigation
    - Connect leaderboard system to existing Branches page
    - Ensure proper state management across components
    - _Requirements: 1.1-1.7, 2.1-2.7_

  - [x] 9.2 Implement caching and performance optimizations
    - Add appropriate caching for ratings data
    - Implement optimistic updates for review actions
    - Add background refresh for leaderboard data
    - _Requirements: 6.4_

  - [x] 9.3 Add comprehensive error boundaries
    - Implement error boundaries for new components
    - Add graceful degradation for API failures
    - Ensure existing functionality remains unaffected
    - _Requirements: 5.5_

- [x] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive implementation from the start
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- The implementation leverages existing UI components and API infrastructure to minimize development time
- All new features maintain backward compatibility with existing functionality