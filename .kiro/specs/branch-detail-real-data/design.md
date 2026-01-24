# Design Document

## Overview

This design transforms the branch detail page from using hardcoded mock data to fetching real branch information through backend APIs. The solution leverages existing API endpoints including user management, reports, ratings, and dashboard services to provide accurate branch details, statistics, and performance metrics.

## Architecture

### Current Architecture Issues
- Branch detail page uses hardcoded `mockBranchDetails` object
- Statistics are fabricated with static values (e.g., `totalCreditOfficers: 5`)
- Growth percentages are hardcoded (e.g., `creditOfficersGrowth: 12.5`)
- No integration with real backend data sources

### New Architecture
```mermaid
graph TD
    A[Branch Detail Page] --> B[Branch Data Service]
    B --> C[User Service API]
    B --> D[Reports Service API]
    B --> E[Ratings Service API]
    B --> F[Dashboard Service API]
    
    C --> G[/users/branches]
    C --> H[/admin/users/branch/{branch}]
    D --> I[/reports/branch/{branchName}]
    E --> J[/ratings/branch/{branchName}]
    F --> K[/dashboard/kpi]
    
    B --> L[Data Aggregation Layer]
    L --> M[Branch Details Model]
    M --> A
```

## Components and Interfaces

### 1. Enhanced Branch Service

**File:** `lib/services/branches.ts`

The existing `getBranchById()` method will be enhanced to fetch real data:

```typescript
interface RealBranchDetails extends Branch {
  statistics: RealBranchStatistics;
  contactInfo: BranchContactInfo;
  performance: BranchPerformanceMetrics;
}

interface RealBranchStatistics {
  totalCreditOfficers: number;
  totalCustomers: number;
  activeLoans: number;
  totalDisbursed: number;
  totalReports: number;
  pendingReports: number;
  missedReports: number;
  // Growth metrics (calculated from historical data or dashboard KPIs)
  creditOfficersGrowth?: number;
  customersGrowth?: number;
  activeLoansGrowth?: number;
  totalDisbursedGrowth?: number;
}

interface BranchContactInfo {
  manager?: string;
  phone?: string;
  email?: string;
  address?: string;
}

interface BranchPerformanceMetrics {
  savingsRating?: number;
  disbursementRating?: number;
  repaymentRating?: number;
  overallRank?: number;
}
```

### 2. Data Aggregation Service

**New File:** `lib/services/branchDataAggregator.ts`

```typescript
interface BranchDataAggregator {
  aggregateBranchData(branchId: string): Promise<RealBranchDetails>;
  fetchBranchUsers(branchName: string): Promise<BranchUserData>;
  fetchBranchReports(branchName: string): Promise<BranchReportData>;
  fetchBranchPerformance(branchName: string): Promise<BranchPerformanceData>;
}
```

### 3. Enhanced Branch Detail Page Component

**File:** `app/dashboard/am/branches/[id]/page.tsx`

The component will be refactored to:
- Remove all mock data generation
- Use the enhanced branch service
- Implement proper loading states for each data section
- Handle partial data availability gracefully

## Data Models

### Branch Data Flow

1. **Branch Identification**
   - Convert URL parameter `id` to branch name
   - Validate branch exists using `/users/branches` endpoint

2. **User Data Aggregation**
   - Fetch branch users via `/admin/users/branch/{branch}`
   - Filter by role to get credit officers and customers
   - Calculate counts and extract contact information

3. **Financial Data Integration**
   - Fetch loans data and filter by branch customers
   - Calculate active loans and disbursement totals
   - Get growth metrics from dashboard KPIs

4. **Reports Integration**
   - Fetch branch reports via `/reports/branch/{branchName}`
   - Calculate report statistics (total, pending, missed)
   - Integrate with existing report statistics service

5. **Performance Data Integration**
   - Fetch ratings via `/ratings/branch/{branchName}`
   - Get leaderboard position for different metrics
   - Display performance trends when available

### API Integration Strategy

```typescript
// Data fetching strategy with parallel requests and graceful degradation
async function fetchBranchData(branchId: string): Promise<RealBranchDetails> {
  const branchName = convertIdToBranchName(branchId);
  
  // Parallel API calls with individual error handling
  const [
    branchUsers,
    branchReports,
    branchRatings,
    dashboardKPIs,
    loansData
  ] = await Promise.allSettled([
    userService.getUsersByBranch(branchName),
    reportsService.getBranchReports(branchName),
    ratingsService.getBranchRating(branchName),
    dashboardService.getKPIs(),
    loanService.getAllLoans()
  ]);
  
  // Aggregate data with fallbacks for failed requests
  return aggregateData({
    branchUsers: extractValue(branchUsers),
    branchReports: extractValue(branchReports),
    branchRatings: extractValue(branchRatings),
    dashboardKPIs: extractValue(dashboardKPIs),
    loansData: extractValue(loansData)
  });
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

<function_calls>
<invoke name="prework">
<parameter name="featureName">branch-detail-real-data

### Property Reflection

After reviewing all properties identified in the prework, several can be consolidated to eliminate redundancy:

**Consolidations:**
- Properties 2.1-2.4 (individual statistics fetching) can be combined into one comprehensive data accuracy property
- Properties 4.1-4.3 (loading states and error handling) can be combined into one comprehensive UI state management property
- Properties 5.1-5.5 (data consistency) can be combined into one comprehensive consistency property
- Properties 6.1-6.5 (performance optimizations) can be combined into one comprehensive performance property

**Unique Properties Retained:**
- API integration behavior (1.1, 1.3)
- Mock data elimination (1.4 - example test)
- Caching behavior (1.5)
- Performance data integration (3.1, 3.2)
- Error handling for invalid IDs (4.5 - example test)

### Correctness Properties

Property 1: Real API Data Integration
*For any* valid branch ID, navigating to the branch detail page should trigger API calls to fetch real data and display information that matches the backend response data
**Validates: Requirements 1.1, 1.2**

Property 2: Comprehensive Data Accuracy
*For any* branch with available data, the displayed statistics (credit officers, customers, loans, reports) should match the counts returned by their respective API endpoints
**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

Property 3: Graceful Error Handling
*For any* API failure scenario, the system should display appropriate error messages and continue to function without crashing
**Validates: Requirements 1.3, 4.2, 4.3**

Property 4: Data Caching Efficiency
*For any* successful branch data fetch, subsequent requests for the same branch should reuse cached data when appropriate
**Validates: Requirements 1.5, 6.1, 6.2**

Property 5: Growth Data Fallback
*For any* branch where growth data is unavailable, the system should display "No data available" instead of mock percentages
**Validates: Requirements 2.6**

Property 6: Performance Data Integration
*For any* branch with ratings data, the displayed performance metrics should match the ratings API response
**Validates: Requirements 3.1, 3.2**

Property 7: Progressive Loading Order
*For any* branch data loading scenario, basic information should be displayed before detailed statistics
**Validates: Requirements 6.3**

Property 8: Data Source Consistency
*For any* branch, the data sources used should be consistent between the detail page and other branch-related pages
**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

Property 9: Performance Optimization
*For any* branch data loading scenario, the system should batch related API calls and implement intelligent caching to minimize network requests
**Validates: Requirements 6.4, 6.5**

## Error Handling

### API Failure Scenarios

1. **Individual Service Failures**
   - User service unavailable: Show "Unable to load staff information"
   - Reports service unavailable: Show "Unable to load report statistics"
   - Ratings service unavailable: Show "Performance data temporarily unavailable"

2. **Partial Data Availability**
   - Display available sections normally
   - Show specific error messages for failed sections
   - Provide retry buttons for failed data

3. **Complete Data Failure**
   - Display "Branch information temporarily unavailable"
   - Provide navigation back to branch list
   - Show retry mechanism for entire page

### Data Validation

```typescript
interface DataValidationRules {
  validateBranchId(id: string): boolean;
  validateBranchName(name: string): boolean;
  validateStatistics(stats: BranchStatistics): boolean;
  sanitizeContactInfo(contact: BranchContactInfo): BranchContactInfo;
}
```

## Testing Strategy

### Unit Tests
- Test individual API integration functions
- Test data aggregation logic with various input scenarios
- Test error handling for specific failure cases
- Test caching mechanisms and cache invalidation
- Test data validation and sanitization functions

### Property-Based Tests
- Test API integration behavior across all valid branch IDs
- Test data accuracy across various branch data combinations
- Test error handling across all possible API failure scenarios
- Test caching efficiency across different usage patterns
- Test performance optimization across various loading scenarios

**Property Test Configuration:**
- Minimum 100 iterations per property test
- Each property test references its design document property
- Tag format: **Feature: branch-detail-real-data, Property {number}: {property_text}**

### Integration Tests
- Test complete branch detail page loading with real API responses
- Test navigation between branch list and detail pages
- Test data consistency between different branch-related pages
- Test performance under various network conditions

### Example Tests
- Test "Branch not found" scenario with invalid branch ID
- Test mock data elimination by verifying no hardcoded values exist
- Test specific error messages for known API failure types
- Test retry mechanisms with simulated temporary failures

The testing approach ensures both comprehensive coverage through property-based testing and specific validation through targeted unit and integration tests.