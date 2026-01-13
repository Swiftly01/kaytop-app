# Growth Data Calculation

This document explains how growth percentages are calculated in the dashboard cards and the different approaches used.

## 📊 **Current Growth Calculation Methods**

### **1. Backend-Provided Growth (Preferred)**
If the backend `/dashboard/kpi` endpoint provides growth data, it's used directly:

```typescript
// Backend response example
{
  "totalCreditOfficers": 25,
  "creditOfficersGrowth": 8.5,  // ← Backend provides this
  "totalCustomers": 150,
  "customersGrowth": -2.3,      // ← Backend provides this
  // ... other fields
}
```

**Usage Priority**: Backend growth data is always used first when available.

### **2. Real Growth Calculation (Fallback)**
When backend doesn't provide growth data, the system calculates real growth by comparing current period with previous period:

```typescript
// Formula: ((current - previous) / previous) * 100
const growthPercentage = ((currentValue - previousValue) / previousValue) * 100;
```

**Example**:
- Current month customers: 150
- Previous month customers: 140
- Growth = ((150 - 140) / 140) * 100 = **7.14%**

### **3. Zero Growth (Final Fallback)**
If both backend data and previous period data are unavailable, growth is set to `0%`.

## 🔄 **How Previous Period is Calculated**

The system automatically determines the previous period based on the current time filter:

### **Time Filter Mappings**:

| Current Period | Previous Period for Comparison |
|---|---|
| **Last 24 Hours** | 24 hours before that (2-3 days ago) |
| **Last 7 Days** | Previous 7 days (8-14 days ago) |
| **Last 30 Days** | Previous 30 days (31-60 days ago) |
| **Custom Date Range** | Same length period immediately before |

### **Custom Date Range Example**:
- Current: Jan 15 - Jan 30 (15 days)
- Previous: Dec 31 - Jan 14 (15 days)

## 🛠 **Implementation Details**

### **Growth Calculation Service** (`lib/services/growthCalculation.ts`)

**Main Methods**:
- `calculateRealGrowth(currentValue, field, params)` - Calculate growth for single metric
- `calculateGrowthForAllMetrics(currentMetrics, params)` - Calculate growth for all metrics at once

**Data Sources for Previous Period**:
- **Branches**: `/users/branches` (count of branches)
- **Credit Officers**: `/admin/users` filtered by role + date range
- **Customers**: `/admin/users` filtered by role + date range  
- **Loans**: `/loans/all` with date range parameters
- **Active Loans**: `/loans/all` filtered by status + date range
- **Missed Payments**: `/loans/missed` with date range parameters

### **Accurate Dashboard Service** (`lib/services/accurateDashboard.ts`)

**Growth Priority Logic**:
```typescript
const getGrowthRate = (field: string, calculatedGrowth: number): number => {
  // 1. Try backend growth first
  if (kpiData[`${field}Growth`] !== undefined && kpiData[`${field}Growth`] !== null) {
    return kpiData[`${field}Growth`];
  }
  
  // 2. Use calculated growth if backend doesn't provide it
  return calculatedGrowth;
};
```

## 📈 **Growth Calculation Examples**

### **Example 1: Credit Officers Growth**

**Current Period (Last 30 Days)**:
- Credit Officers: 25

**Previous Period (31-60 Days Ago)**:
- Credit Officers: 23

**Calculation**:
```typescript
growth = ((25 - 23) / 23) * 100 = 8.70%
```

**Result**: "+8.70% this month"

### **Example 2: Loan Amount Growth**

**Current Period**:
- Total Loan Amount: ₦5,000,000

**Previous Period**:
- Total Loan Amount: ₦5,200,000

**Calculation**:
```typescript
growth = ((5000000 - 5200000) / 5200000) * 100 = -3.85%
```

**Result**: "-3.85% this month"

### **Example 3: New Metric (No Previous Data)**

**Current Period**:
- New Branches: 3

**Previous Period**:
- No data available

**Result**: "+0% this month" (fallback)

## 🔧 **Configuration & Customization**

### **Time Period Adjustments**
You can modify the previous period calculation logic in `calculatePreviousPeriod()`:

```typescript
// Example: Change "last 30 days" comparison to 60 days ago
case 'last_30_days':
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 90); // Changed from -60
  // ...
```

### **Adding New Metrics**
To add growth calculation for new metrics:

1. **Add to `getPreviousPeriodData()`**:
```typescript
case 'newMetric':
  return await this.getPreviousNewMetricCount(previousParams);
```

2. **Implement the fetch method**:
```typescript
private async getPreviousNewMetricCount(params: DashboardParams): Promise<number> {
  // Fetch previous period data for new metric
}
```

3. **Add to `calculateGrowthForAllMetrics()`**:
```typescript
const newMetricGrowth = await this.calculateRealGrowth(
  currentMetrics.newMetric, 
  'newMetric', 
  params
);
```

## ⚠️ **Important Notes**

### **Data Accuracy**
- Growth calculations depend on accurate date filtering in backend endpoints
- Some endpoints may not support date range filtering
- Missing historical data will result in 0% growth

### **Performance Considerations**
- Growth calculation requires additional API calls to fetch previous period data
- Calculations are done in parallel to minimize latency
- Failed calculations gracefully fall back to 0% growth

### **Backend Dependencies**
The growth calculation system depends on these endpoints supporting date range parameters:
- `/admin/users?startDate=X&endDate=Y`
- `/loans/all?startDate=X&endDate=Y`
- `/loans/missed?startDate=X&endDate=Y`

## 🚀 **Future Enhancements**

### **Potential Improvements**:
1. **Caching**: Cache previous period data to reduce API calls
2. **Batch Endpoints**: Create dedicated endpoints for growth calculations
3. **Real-time Updates**: WebSocket integration for live growth updates
4. **Historical Trends**: Store and display growth trends over multiple periods
5. **Comparative Analysis**: Compare growth across different branches or regions

## 📝 **Summary**

The growth data is obtained through a **three-tier approach**:

1. **🥇 Backend Growth Data** - Used when available from `/dashboard/kpi`
2. **🥈 Calculated Growth** - Real comparison with previous period data
3. **🥉 Zero Growth** - Fallback when no data is available

This ensures that dashboard cards always show meaningful growth percentages based on real data rather than random or mock values.