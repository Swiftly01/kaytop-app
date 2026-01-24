# Requirements Document

## Introduction

The Kaytop HQ Dashboard Enhancement project aims to implement a comprehensive report review workflow and branch performance leaderboard system for HQ managers. This system will enable efficient monitoring, review, and performance tracking across all branches in the Kaytop microfinance platform.

## Glossary

- **HQ_Manager**: Headquarters manager role with system-wide oversight capabilities
- **Report_System**: The existing report submission and management infrastructure
- **Branch_Aggregate**: Consolidated report data grouped by branch rather than individual credit officers
- **Performance_Leaderboard**: Ranking system for branches based on key performance metrics
- **Rating_Engine**: Backend service that calculates performance ratings for branches
- **Review_Workflow**: The approval/rejection process for submitted reports

## Requirements

### Requirement 1: Report Review Workflow Enhancement

**User Story:** As an HQ manager, I want to review and approve branch reports in aggregate view, so that I can efficiently oversee branch performance and ensure compliance.

#### Acceptance Criteria

1. WHEN an HQ manager accesses the Reports page, THE System SHALL display a toggle to switch between "Individual Reports" and "Branch Aggregates" views
2. WHEN the "Branch Aggregates" view is selected, THE System SHALL replace the "Credit Officer" column with a "Branch Name" column
3. WHEN displaying branch aggregates, THE System SHALL fetch data using GET /reports/branch/{branchName} endpoint for each branch
4. WHEN an HQ manager clicks on a branch aggregate row, THE System SHALL open a detailed review modal using GET /reports/{id}
5. WHEN reviewing a report, THE System SHALL provide "Approve" and "Reject" buttons at the bottom of the detail view
6. WHEN an HQ manager approves a report, THE System SHALL call PUT /reports/{id}/hq-review with action: "APPROVE"
7. WHEN an HQ manager rejects a report, THE System SHALL call PUT /reports/{id}/hq-review with action: "DECLINE" and remarks

### Requirement 2: Branch Performance Leaderboard System

**User Story:** As an HQ manager, I want to view branch performance rankings and metrics, so that I can identify top performers and areas needing improvement.

#### Acceptance Criteria

1. WHEN an HQ manager accesses the Branches page, THE System SHALL display a "Leaderboard" tab next to the "Branches" section header
2. WHEN the Leaderboard tab is active, THE System SHALL replace standard stat cards with three performance-focused cards: "Top by Savings", "Top by Loan Disbursement", and "Top by Loan Repayment"
3. WHEN the leaderboard is displayed, THE System SHALL provide a "Calculate Ratings" button near the Filters button
4. WHEN the "Calculate Ratings" button is clicked, THE System SHALL trigger GET /ratings/calculate?period=DAILY&periodDate={currentDate}
5. WHEN displaying the leaderboard table, THE System SHALL fetch data using GET /ratings/leaderboard?type={type}&period={period}&limit={limit}
6. WHEN filtering leaderboard data, THE System SHALL provide dropdown options for type (MONEY_DISBURSED, LOAN_REPAYMENT, SAVINGS) and period (DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY)
7. WHEN searching for specific branch performance, THE System SHALL integrate GET /ratings/branch/{name} into the existing branch search

### Requirement 3: Authentication and Authorization

**User Story:** As a system administrator, I want to ensure only HQ managers can access these enhanced features, so that sensitive performance data remains secure.

#### Acceptance Criteria

1. WHEN a user attempts to access enhanced report features, THE System SHALL verify the user has hq_manager role
2. WHEN a user without hq_manager role tries to access these features, THE System SHALL deny access and redirect appropriately
3. WHEN making API requests for enhanced features, THE System SHALL include proper Authorization Bearer token headers
4. THE System SHALL use existing authentication infrastructure (Axios interceptors or global state) for all new API requests

### Requirement 4: UI Pattern Consistency

**User Story:** As an HQ manager, I want the new features to follow existing UI patterns, so that I can navigate the system intuitively.

#### Acceptance Criteria

1. WHEN displaying new components, THE System SHALL follow the existing sidebar-based navigation structure
2. WHEN showing performance metrics, THE System SHALL use existing card components with green/red percentage indicators and rounded borders
3. WHEN presenting tabular data, THE System SHALL follow existing table UI patterns with specific header font weights, checkbox columns on the left, and action icons on the right
4. WHEN providing time-based filters, THE System SHALL use existing pill-shaped time filters (12 months, 30 days, etc.) for rating periods
5. THE System SHALL maintain consistent color schemes, typography, and spacing as defined in existing components

### Requirement 5: Data Integration and API Compliance

**User Story:** As a developer, I want the new features to integrate seamlessly with existing backend services, so that data consistency is maintained.

#### Acceptance Criteria

1. WHEN making API requests, THE System SHALL use exact backend enums for all requests: SAVINGS, MONEY_DISBURSED, LOAN_REPAYMENT
2. WHEN fetching report data, THE System SHALL handle the existing PaginatedResponse structure with {data: [], pagination: {}}
3. WHEN processing performance data, THE System SHALL transform backend responses to match existing UI component interfaces
4. WHEN handling errors, THE System SHALL use existing error handling patterns and toast notification system
5. THE System SHALL maintain backward compatibility with existing report and branch management functionality

### Requirement 6: Performance Metrics Calculation

**User Story:** As an HQ manager, I want accurate performance calculations, so that I can make informed decisions about branch operations.

#### Acceptance Criteria

1. WHEN calculating branch ratings, THE System SHALL support DAILY, WEEKLY, MONTHLY, QUARTERLY, and YEARLY period options
2. WHEN displaying performance metrics, THE System SHALL show rankings for savings collection, loan disbursement, and loan repayment
3. WHEN performance data is unavailable, THE System SHALL display appropriate fallback messages and retry options
4. WHEN ratings are calculated, THE System SHALL cache results appropriately to avoid excessive API calls
5. THE System SHALL provide real-time updates when performance data changes

### Requirement 7: Report Detail Enhancement

**User Story:** As an HQ manager, I want comprehensive report details in the review modal, so that I can make informed approval decisions.

#### Acceptance Criteria

1. WHEN opening a report detail modal, THE System SHALL display branch name, total savings, total disbursed, total repaid, and current status
2. WHEN reviewing report history, THE System SHALL show previous approval/rejection actions and timestamps
3. WHEN approving or rejecting reports, THE System SHALL require confirmation and optional comments
4. WHEN report actions are completed, THE System SHALL update the UI immediately and show success notifications
5. THE System SHALL handle concurrent review scenarios where multiple HQ managers might review the same report

### Requirement 8: Search and Filter Integration

**User Story:** As an HQ manager, I want to search and filter performance data efficiently, so that I can quickly find specific information.

#### Acceptance Criteria

1. WHEN searching in the leaderboard, THE System SHALL support branch name filtering and performance metric filtering
2. WHEN applying filters, THE System SHALL maintain filter state across page navigation within the same session
3. WHEN clearing filters, THE System SHALL reset to default view and show appropriate confirmation
4. WHEN no results match filters, THE System SHALL display helpful empty state messages with suggested actions
5. THE System SHALL provide autocomplete suggestions for branch names in search fields