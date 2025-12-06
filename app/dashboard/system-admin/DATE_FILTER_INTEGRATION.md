# Date Range Filter Integration Guide

## Overview

The System Admin Dashboard now includes a fully functional date range picker that allows users to filter all dashboard data dynamically. This guide explains how to integrate it with your backend API.

## Components Involved

### 1. **DateRangePicker** (`app/_components/ui/DateRangePicker.tsx`)
- Displays a calendar with dual month view
- Provides quick preset options (Today, Yesterday, This week, Last week, This month, Last month)
- Has Cancel and Apply buttons
- Only triggers data fetch when "Apply" is clicked

### 2. **FilterControls** (`app/_components/ui/FilterControls.tsx`)
- Contains the "Select dates" button
- Manages the date picker visibility
- Passes selected date range to parent component

### 3. **Dashboard Page** (`app/dashboard/system-admin/page.tsx`)
- Receives date range from FilterControls
- Should fetch filtered data from backend
- Updates all dashboard components with filtered data

## Current Implementation

### State Management

```typescript
const [dateRange, setDateRange] = useState<DateRange | undefined>();
const [timePeriod, setTimePeriod] = useState<string>('12months');
```

### Event Handlers

```typescript
const handleDateRangeChange = (range: DateRange | undefined) => {
  setDateRange(range);
  // This is called when user clicks "Apply" in the date picker
  // range.from = start date
  // range.to = end date
};

const handleTimePeriodChange = (period: string) => {
  setTimePeriod(period);
  // This is called when user clicks time period buttons (12 months, 30 days, etc.)
};
```

## Backend Integration Steps

### Step 1: Convert Static Data to State

Currently, the dashboard uses static data arrays. Convert them to state:

```typescript
// Before
const topCardSections = [...];

// After
const [topCardSections, setTopCardSections] = useState([...]);
const [middleCardSections, setMiddleCardSections] = useState([...]);
const [bestPerformingBranches, setBestPerformingBranches] = useState([...]);
const [worstPerformingBranches, setWorstPerformingBranches] = useState([...]);
const [tableData, setTableData] = useState([...]);
```

### Step 2: Create Backend API Endpoint

Create an API endpoint that accepts date range parameters:

```typescript
// app/api/dashboard/overview/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  
  // Query your database with date filters
  const data = await fetchDashboardData(startDate, endDate);
  
  return Response.json({
    statistics: {
      top: [...], // 4 sections for top card
      middle: [...], // 3 sections for middle card
    },
    performance: {
      best: [...], // Top 3 best performing branches
      worst: [...], // Top 3 worst performing branches
    },
    loans: [...], // Loan data for table
  });
}
```

### Step 3: Implement Data Fetching

Update the `handleDateRangeChange` function:

```typescript
const handleDateRangeChange = async (range: DateRange | undefined) => {
  if (!range?.from || !range?.to) return;
  
  setDateRange(range);
  setIsLoading(true);
  
  try {
    // Format dates for API
    const startDate = format(range.from, 'yyyy-MM-dd');
    const endDate = format(range.to, 'yyyy-MM-dd');
    
    // Fetch filtered data
    const response = await fetch(
      `/api/dashboard/overview?startDate=${startDate}&endDate=${endDate}`
    );
    const data = await response.json();
    
    // Update all dashboard components
    setTopCardSections(data.statistics.top);
    setMiddleCardSections(data.statistics.middle);
    setBestPerformingBranches(data.performance.best);
    setWorstPerformingBranches(data.performance.worst);
    setTableData(data.loans);
    
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Handle error (show toast notification, etc.)
  } finally {
    setIsLoading(false);
  }
};
```

### Step 4: Add Loading States

Add loading indicators while data is being fetched:

```typescript
const [isLoading, setIsLoading] = useState(false);

// In your JSX
{isLoading ? (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7F56D9]"></div>
  </div>
) : (
  <StatisticsCard sections={topCardSections} />
)}
```

### Step 5: Update Table Component

The Table component should accept filtered data as props:

```typescript
// Update Table.tsx to accept data prop
interface TableProps {
  data?: LoanRecord[];
}

// In page.tsx
<Table data={tableData} />
```

## Data Flow

```
User selects date range
    ↓
Clicks "Apply" button
    ↓
DateRangePicker.onApply() called
    ↓
FilterControls.handleDateRangeApply() called
    ↓
Dashboard.handleDateRangeChange() called
    ↓
Fetch data from backend API
    ↓
Update all component states
    ↓
Dashboard re-renders with filtered data
```

## Date Range Object Structure

```typescript
interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

// Example
{
  from: new Date('2024-01-01'),
  to: new Date('2024-01-31')
}
```

## Preset Calculations

The date picker includes these presets:

- **Today**: `{ from: today, to: today }`
- **Yesterday**: `{ from: yesterday, to: yesterday }`
- **This week**: Monday to Sunday of current week
- **Last week**: Monday to Sunday of previous week
- **This month**: First day to last day of current month
- **Last month**: First day to last day of previous month

## Testing

1. **Test date range selection**:
   - Select a custom date range
   - Click Apply
   - Verify console logs show correct dates

2. **Test presets**:
   - Click each preset button
   - Click Apply
   - Verify correct date ranges are calculated

3. **Test Cancel**:
   - Select a date range
   - Click Cancel
   - Verify picker closes without triggering data fetch

4. **Test time period buttons**:
   - Click "12 months", "30 days", etc.
   - Verify `handleTimePeriodChange` is called

## Next Steps

1. ✅ Date picker UI implemented
2. ✅ Cancel and Apply buttons added
3. ✅ State management set up
4. ⏳ Convert static data to state variables
5. ⏳ Create backend API endpoint
6. ⏳ Implement data fetching logic
7. ⏳ Add loading states
8. ⏳ Update Table component to accept props
9. ⏳ Add error handling
10. ⏳ Test with real backend data

## Additional Features to Consider

- **Date range validation**: Prevent selecting future dates
- **Maximum range**: Limit selection to 1 year maximum
- **Caching**: Cache API responses to avoid redundant requests
- **Debouncing**: If implementing real-time filtering
- **URL parameters**: Store selected date range in URL for sharing
- **Export functionality**: Allow exporting filtered data
- **Comparison mode**: Compare two date ranges side-by-side

## Support

For questions or issues, refer to:
- `app/_components/ui/DateRangePicker.tsx` - Date picker component
- `app/_components/ui/FilterControls.tsx` - Filter controls wrapper
- `app/dashboard/system-admin/page.tsx` - Dashboard page with integration
