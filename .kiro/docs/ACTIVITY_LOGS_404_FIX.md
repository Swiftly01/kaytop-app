# Activity Logs 404 Error - Diagnosis & Fix

## Issue Summary
You're getting a 404 error when calling `/admin/activity-logs?page=1&limit=10` from your frontend, but the endpoint works fine in Postman testing (95.2% success rate).

## Root Cause Analysis

Based on the error and testing results, the issue is likely one of these:

1. **Authentication Token Issue** - Frontend token might be expired/invalid
2. **Request Headers Missing** - Frontend might not be sending proper headers
3. **Environment Configuration** - API base URL mismatch
4. **Timing Issue** - Race condition in authentication

## Immediate Fix

### 1. Enhanced Error Handling in Activity Logs Service

Update your activity logs service with better error handling and debugging:

```typescript
// lib/services/activityLogs.ts - Enhanced version
async getActivityLogs(filters: ActivityLogFilters = {}): Promise<PaginatedResponse<ActivityLog>> {
  try {
    console.log('🔍 Activity Logs Request Debug:', {
      filters,
      baseUrl: API_ENDPOINTS.ACTIVITY_LOGS.LIST,
      timestamp: new Date().toISOString()
    });

    const params = new URLSearchParams();
    
    // Add filter parameters
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.userRole) params.append('userRole', filters.userRole);
    if (filters.actionType) params.append('actionType', filters.actionType);
    if (filters.entityType) params.append('entityType', filters.entityType);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const url = `${API_ENDPOINTS.ACTIVITY_LOGS.LIST}${params.toString() ? `?${params.toString()}` : ''}`;
    
    console.log('🚀 Making request to:', url);
    
    const response = await apiClient.get<any>(url);

    console.log('✅ Activity logs response received:', {
      responseType: typeof response,
      isArray: Array.isArray(response),
      hasData: !!response?.data,
      keys: response ? Object.keys(response) : []
    });

    // Backend returns direct data format, not wrapped in success/data
    if (response && typeof response === 'object') {
      // Check if it's wrapped in success/data format
      if (response.success && response.data) {
        return response.data;
      }
      // Check if it's direct array format (activity logs list)
      else if (Array.isArray(response)) {
        // Backend returns direct array, create paginated response structure
        return {
          data: response,
          pagination: {
            total: response.length,
            page: parseInt(filters.page?.toString() || '1'),
            limit: parseInt(filters.limit?.toString() || '50'),
            totalPages: Math.ceil(response.length / parseInt(filters.limit?.toString() || '50'))
          }
        };
      }
      // Check if it's already a paginated response object
      else if (response.data && Array.isArray(response.data)) {
        return response as unknown as PaginatedResponse<ActivityLog>;
      }
      // Handle empty response
      else if (Object.keys(response).length === 0) {
        console.log('📝 Empty response received, returning empty data');
        return {
          data: [],
          pagination: {
            total: 0,
            page: parseInt(filters.page?.toString() || '1'),
            limit: parseInt(filters.limit?.toString() || '50'),
            totalPages: 0
          }
        };
      }
    }

    throw new Error('Failed to fetch activity logs - invalid response format');
  } catch (error) {
    console.error('❌ Activity logs fetch error:', {
      error: error instanceof Error ? error.message : error,
      status: (error as any)?.status,
      details: (error as any)?.details,
      url: `${API_ENDPOINTS.ACTIVITY_LOGS.LIST}`,
      filters
    });

    // If it's a 404 error, provide helpful guidance
    if ((error as any)?.status === 404) {
      console.error('🚨 ACTIVITY LOGS 404 ERROR DETECTED');
      console.error('💡 TROUBLESHOOTING STEPS:');
      console.error('1. Check if backend endpoint /admin/activity-logs exists');
      console.error('2. Verify authentication token is valid');
      console.error('3. Check API base URL configuration');
      console.error('4. Verify user has admin permissions');
      
      // Return empty data instead of throwing to prevent UI crash
      return {
        data: [],
        pagination: {
          total: 0,
          page: parseInt(filters.page?.toString() || '1'),
          limit: parseInt(filters.limit?.toString() || '50'),
          totalPages: 0
        }
      };
    }

    throw error;
  }
}
```

### 2. Enhanced React Query with Better Error Handling

Update your useActivityLogs query:

```typescript
// app/dashboard/system-admin/queries/useSettingsQueries.ts
export function useActivityLogs(filters: ActivityLogFilters) {
  return useQuery<{ data: ActivityLog[]; pagination: any }, AxiosError>({
    queryKey: ["activity-logs", filters],
    queryFn: async () => {
      console.log('🔄 useActivityLogs query executing with filters:', filters);
      
      try {
        const result = await activityLogsService.getActivityLogs(filters);
        console.log('✅ useActivityLogs query successful:', {
          dataLength: result.data?.length || 0,
          pagination: result.pagination
        });
        return result;
      } catch (error) {
        console.error('❌ useActivityLogs query failed:', error);
        
        // Log additional debugging info
        console.error('🔍 Query Debug Info:', {
          filters,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          currentUrl: window.location.href
        });
        
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (endpoint doesn't exist)
      if ((error as any)?.status === 404) {
        console.log('🚫 Not retrying 404 error for activity logs');
        return false;
      }
      
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    enabled: !!filters, // Only run query when filters are provided
    
    // Add error handling
    onError: (error) => {
      console.error('🚨 Activity Logs Query Error:', {
        message: error.message,
        status: (error as any)?.status,
        details: (error as any)?.details
      });
    },
    
    // Add success logging
    onSuccess: (data) => {
      console.log('🎉 Activity Logs Query Success:', {
        recordCount: data.data?.length || 0,
        pagination: data.pagination
      });
    }
  });
}
```

### 3. Frontend Component Error Handling

Update your settings page to handle the error gracefully:

```typescript
// app/dashboard/system-admin/settings/page.tsx - Add this error handling
const {
  data: activityLogsData, 
  isLoading: activityLogsLoading, 
  error: activityLogsError 
} = useActivityLogs({
  search: searchQuery || undefined,
  page: currentPage,
  limit: 10,
});

// Add error handling in your component render
{activityLogsError ? (
  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
    <div className="flex items-center mb-2">
      <div className="text-red-800 font-medium">Activity Logs Unavailable</div>
    </div>
    <div className="text-red-700 text-sm mb-4">
      {activityLogsError.message || 'Failed to load activity logs'}
    </div>
    <div className="text-red-600 text-xs">
      {(activityLogsError as any)?.status === 404 
        ? 'The activity logs endpoint is not available. Please contact your system administrator.'
        : 'There was an error loading activity logs. Please try again later.'
      }
    </div>
  </div>
) : (
  // Your normal activity logs display
  <div>
    {/* Activity logs content */}
  </div>
)}
```

## Verification Steps

### 1. Test the Fix

1. **Clear browser cache and localStorage**
2. **Log out and log back in** to get a fresh token
3. **Check browser console** for the new debug logs
4. **Navigate to System Admin Settings** page

### 2. Check Debug Output

Look for these console messages:
- `🔍 Activity Logs Request Debug:` - Shows request details
- `🚀 Making request to:` - Shows the exact URL being called
- `✅ Activity logs response received:` - Shows response structure
- `❌ Activity logs fetch error:` - Shows detailed error info

### 3. Alternative Endpoint Test

If the issue persists, try testing alternative endpoints:

```typescript
// Temporary test - add this to your settings page
useEffect(() => {
  const testActivityLogsEndpoint = async () => {
    try {
      console.log('🧪 Testing activity logs endpoint directly...');
      
      // Test without pagination
      const response1 = await apiClient.get('/admin/activity-logs');
      console.log('✅ Direct endpoint test successful:', response1);
      
    } catch (error) {
      console.error('❌ Direct endpoint test failed:', error);
      
      // Try alternative endpoint
      try {
        const response2 = await apiClient.get('/activity-logs');
        console.log('✅ Alternative endpoint successful:', response2);
      } catch (altError) {
        console.error('❌ Alternative endpoint also failed:', altError);
      }
    }
  };
  
  // Run test only once
  if (process.env.NODE_ENV === 'development') {
    testActivityLogsEndpoint();
  }
}, []);
```

## Expected Results

After implementing these fixes:

1. **Better Error Messages** - You'll see detailed error information in console
2. **Graceful Degradation** - UI won't crash, shows error state instead
3. **Debug Information** - Clear logs to identify the exact issue
4. **Fallback Behavior** - Empty state instead of error for 404s

## If Issue Persists

If you still get 404 errors after this fix:

1. **Check Backend Deployment** - The endpoint might have been removed/changed
2. **Verify API Base URL** - Ensure `NEXT_PUBLIC_KAYTOP_API_BASE_URL` is correct
3. **Test in Postman** - Confirm the endpoint still works with fresh authentication
4. **Check Backend Logs** - Look for any server-side errors

The enhanced error handling will give you much better visibility into what's causing the 404 error.