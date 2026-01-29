#!/usr/bin/env node

/**
 * Comprehensive Stats and KPI Endpoints Analysis
 * Deep dive into all statistics and KPI endpoints for branch customer data
 */

const https = require('https');

const BASE_URL = 'https://kaytop-production.up.railway.app';
const CREDENTIALS = {
  email: 'admin@kaytop.com',
  password: 'Admin123',
  userType: 'admin'
};

// Comprehensive list of stats and KPI endpoints to test
const STATS_KPI_ENDPOINTS = [
  // Dashboard KPI variations
  { name: 'Dashboard KPI', path: '/dashboard/kpi', method: 'GET' },
  { name: 'Dashboard KPIs', path: '/dashboard/kpis', method: 'GET' },
  { name: 'Dashboard Statistics', path: '/dashboard/statistics', method: 'GET' },
  { name: 'Dashboard Stats', path: '/dashboard/stats', method: 'GET' },
  { name: 'Dashboard Metrics', path: '/dashboard/metrics', method: 'GET' },
  { name: 'Dashboard Analytics', path: '/dashboard/analytics', method: 'GET' },
  { name: 'Dashboard Summary', path: '/dashboard/summary', method: 'GET' },
  
  // Admin statistics
  { name: 'Admin Statistics', path: '/admin/statistics', method: 'GET' },
  { name: 'Admin Stats', path: '/admin/stats', method: 'GET' },
  { name: 'Admin KPI', path: '/admin/kpi', method: 'GET' },
  { name: 'Admin KPIs', path: '/admin/kpis', method: 'GET' },
  { name: 'Admin Metrics', path: '/admin/metrics', method: 'GET' },
  { name: 'Admin Analytics', path: '/admin/analytics', method: 'GET' },
  { name: 'Admin Summary', path: '/admin/summary', method: 'GET' },
  
  // Statistics endpoints
  { name: 'Statistics', path: '/statistics', method: 'GET' },
  { name: 'Stats', path: '/stats', method: 'GET' },
  { name: 'KPI', path: '/kpi', method: 'GET' },
  { name: 'KPIs', path: '/kpis', method: 'GET' },
  { name: 'Metrics', path: '/metrics', method: 'GET' },
  { name: 'Analytics', path: '/analytics', method: 'GET' },
  
  // Branch-specific stats
  { name: 'Branch Statistics', path: '/statistics/branches', method: 'GET' },
  { name: 'Branch Stats', path: '/stats/branches', method: 'GET' },
  { name: 'Branch KPI', path: '/kpi/branches', method: 'GET' },
  { name: 'Branch Metrics', path: '/metrics/branches', method: 'GET' },
  { name: 'Branch Analytics', path: '/analytics/branches', method: 'GET' },
  
  // User statistics
  { name: 'User Statistics', path: '/statistics/users', method: 'GET' },
  { name: 'User Stats', path: '/stats/users', method: 'GET' },
  { name: 'User KPI', path: '/kpi/users', method: 'GET' },
  { name: 'User Metrics', path: '/metrics/users', method: 'GET' },
  { name: 'User Analytics', path: '/analytics/users', method: 'GET' },
  
  // Admin user statistics
  { name: 'Admin User Statistics', path: '/admin/users/statistics', method: 'GET' },
  { name: 'Admin User Stats', path: '/admin/users/stats', method: 'GET' },
  { name: 'Admin User KPI', path: '/admin/users/kpi', method: 'GET' },
  { name: 'Admin User Metrics', path: '/admin/users/metrics', method: 'GET' },
  { name: 'Admin User Analytics', path: '/admin/users/analytics', method: 'GET' },
  
  // Reports statistics
  { name: 'Reports Statistics', path: '/reports/statistics', method: 'GET' },
  { name: 'Reports Stats', path: '/reports/stats', method: 'GET' },
  { name: 'Reports KPI', path: '/reports/kpi', method: 'GET' },
  { name: 'Reports Metrics', path: '/reports/metrics', method: 'GET' },
  { name: 'Reports Analytics', path: '/reports/analytics', method: 'GET' },
  
  // API versioned endpoints
  { name: 'API v1 Statistics', path: '/api/v1/statistics', method: 'GET' },
  { name: 'API v1 Stats', path: '/api/v1/stats', method: 'GET' },
  { name: 'API v1 KPI', path: '/api/v1/kpi', method: 'GET' },
  { name: 'API v1 Metrics', path: '/api/v1/metrics', method: 'GET' },
  { name: 'API v1 Analytics', path: '/api/v1/analytics', method: 'GET' },
  
  // Query parameter variations on known working endpoints
  { name: 'Dashboard KPI with Branch Stats', path: '/dashboard/kpi?include=branches', method: 'GET' },
  { name: 'Dashboard KPI with User Stats', path: '/dashboard/kpi?include=users', method: 'GET' },
  { name: 'Dashboard KPI with Branch Breakdown', path: '/dashboard/kpi?breakdown=branch', method: 'GET' },
  { name: 'Dashboard KPI Grouped by Branch', path: '/dashboard/kpi?groupBy=branch', method: 'GET' }
];

/**
 * Make HTTP request
 */
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsedBody = body ? JSON.parse(body) : null;
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsedBody,
            rawBody: body
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: null,
            rawBody: body,
            parseError: e.message
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Authenticate and get token
 */
async function authenticate() {
  console.log('🔐 Authenticating...');
  
  const options = {
    hostname: 'kaytop-production.up.railway.app',
    port: 443,
    path: '/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await makeRequest(options, CREDENTIALS);
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      const token = response.body?.access_token;
      if (token) {
        console.log('✅ Authentication successful');
        return token;
      }
    }
    return null;
  } catch (error) {
    console.log('❌ Authentication error:', error.message);
    return null;
  }
}

/**
 * Test endpoint and analyze for branch customer data
 */
async function testStatsEndpoint(endpoint, token) {
  const options = {
    hostname: 'kaytop-production.up.railway.app',
    port: 443,
    path: endpoint.path,
    method: endpoint.method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await makeRequest(options);
    
    const result = {
      name: endpoint.name,
      path: endpoint.path,
      statusCode: response.statusCode,
      success: response.statusCode >= 200 && response.statusCode < 300,
      body: response.body
    };

    // Analyze for branch customer data
    if (result.success && result.body) {
      const analysis = analyzeBranchCustomerData(result.body, endpoint.name);
      result.analysis = analysis;
      
      if (analysis.hasBranchCustomerCounts) {
        console.log(`🎯 JACKPOT! ${result.name} (${result.path})`);
        console.log(`   📊 ${analysis.summary}`);
        console.log(`   🏗️ Structure: ${analysis.structure}`);
        console.log(`   📋 Branch Data Keys: ${analysis.branchDataKeys.join(', ')}`);
        if (analysis.sampleBranchData) {
          console.log(`   📄 Sample Branch Data:`, JSON.stringify(analysis.sampleBranchData, null, 2));
        }
        console.log('');
      } else if (analysis.hasBranchData || analysis.hasCustomerData) {
        console.log(`⚠️ Partial: ${result.name} - ${analysis.summary}`);
        if (analysis.branchDataKeys.length > 0) {
          console.log(`   🔑 Branch Keys: ${analysis.branchDataKeys.join(', ')}`);
        }
      }
    } else if (result.statusCode === 404) {
      // Silent for 404s to reduce noise
    } else if (result.statusCode !== 404) {
      console.log(`❌ ${result.name} (${result.statusCode})`);
    }

    return result;
  } catch (error) {
    return {
      name: endpoint.name,
      path: endpoint.path,
      statusCode: 0,
      success: false,
      error: error.message
    };
  }
}

/**
 * Analyze response for branch customer data with detailed inspection
 */
function analyzeBranchCustomerData(body, endpointName) {
  let hasBranchData = false;
  let hasCustomerData = false;
  let hasBranchCustomerCounts = false;
  let structure = '';
  let summary = '';
  let branchDataKeys = [];
  let sampleBranchData = null;

  if (Array.isArray(body)) {
    structure = `Array[${body.length}]`;
    
    if (body.length > 0) {
      const firstItem = body[0];
      
      // Check for branch data in array items
      if (firstItem.branch || firstItem.branchName || firstItem.name) {
        hasBranchData = true;
        branchDataKeys.push('branch/branchName/name');
      }
      
      // Check for customer counts in array items
      if (firstItem.customers || firstItem.customerCount || firstItem.totalCustomers || 
          firstItem.userCount || firstItem.totalUsers) {
        hasCustomerData = true;
        branchDataKeys.push('customers/customerCount/totalCustomers');
      }
      
      if (hasBranchData && hasCustomerData) {
        hasBranchCustomerCounts = true;
        sampleBranchData = firstItem;
        summary = 'Array with branch names and customer counts';
      }
    }
  } else if (typeof body === 'object' && body !== null) {
    const keys = Object.keys(body);
    structure = `Object{${keys.length} keys}`;
    
    // Special handling for dashboard KPI structure
    if (endpointName.toLowerCase().includes('dashboard') && endpointName.toLowerCase().includes('kpi')) {
      console.log(`\\n🔍 DETAILED DASHBOARD KPI ANALYSIS:`);
      console.log(`📋 All Keys: ${keys.join(', ')}`);
      
      // Look for branch-related data
      const branchKeys = keys.filter(key => key.toLowerCase().includes('branch'));
      if (branchKeys.length > 0) {
        console.log(`🏢 Branch-related keys: ${branchKeys.join(', ')}`);
        branchDataKeys.push(...branchKeys);
        hasBranchData = true;
      }
      
      // Look for customer-related data
      const customerKeys = keys.filter(key => 
        key.toLowerCase().includes('customer') || 
        key.toLowerCase().includes('user') ||
        key.toLowerCase().includes('total')
      );
      if (customerKeys.length > 0) {
        console.log(`👥 Customer-related keys: ${customerKeys.join(', ')}`);
        hasCustomerData = true;
      }
      
      // Check specific arrays that might contain branch data
      ['officerPerformance', 'topPerformers', 'branchPerformance', 'branchStats'].forEach(arrayKey => {
        if (body[arrayKey] && Array.isArray(body[arrayKey])) {
          console.log(`\\n📊 Analyzing ${arrayKey} array (${body[arrayKey].length} items):`);
          
          if (body[arrayKey].length > 0) {
            const firstItem = body[arrayKey][0];
            console.log(`   🔑 Keys: ${Object.keys(firstItem).join(', ')}`);
            console.log(`   📄 Sample:`, JSON.stringify(firstItem, null, 2));
            
            if (firstItem.branch || firstItem.branchName) {
              hasBranchData = true;
              branchDataKeys.push(`${arrayKey}[].branch`);
              
              // Check if this array has customer counts
              if (firstItem.customers || firstItem.customerCount || firstItem.totalCustomers) {
                hasCustomerData = true;
                hasBranchCustomerCounts = true;
                sampleBranchData = { [arrayKey]: firstItem };
                summary = `Dashboard KPI contains branch customer data in ${arrayKey}`;
              }
            }
          }
        }
      });
    }
    
    // General object analysis
    for (const [key, value] of Object.entries(body)) {
      if (key.toLowerCase().includes('branch') && Array.isArray(value)) {
        hasBranchData = true;
        branchDataKeys.push(key);
        
        if (value.length > 0) {
          const firstItem = value[0];
          if (firstItem.customers || firstItem.customerCount || firstItem.totalCustomers ||
              firstItem.userCount || firstItem.totalUsers) {
            hasCustomerData = true;
            hasBranchCustomerCounts = true;
            sampleBranchData = { [key]: firstItem };
            summary = `Object with branch array '${key}' containing customer counts`;
          }
        }
      }
      
      // Check for branch statistics objects
      if ((key.toLowerCase().includes('branch') && key.toLowerCase().includes('stat')) ||
          (key.toLowerCase().includes('branch') && key.toLowerCase().includes('count')) ||
          (key.toLowerCase().includes('branch') && key.toLowerCase().includes('summary'))) {
        hasBranchData = true;
        hasCustomerData = true;
        branchDataKeys.push(key);
        sampleBranchData = { [key]: value };
        summary = `Object with branch statistics in '${key}'`;
      }
    }
  }

  if (!summary) {
    if (hasBranchData && hasCustomerData) {
      summary = 'Contains both branch and customer data';
    } else if (hasBranchData) {
      summary = 'Contains branch data only';
    } else if (hasCustomerData) {
      summary = 'Contains customer data only';
    } else {
      summary = 'No relevant data';
    }
  }

  return {
    hasBranchData,
    hasCustomerData,
    hasBranchCustomerCounts,
    structure,
    summary,
    branchDataKeys,
    sampleBranchData
  };
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 COMPREHENSIVE STATS & KPI ENDPOINTS ANALYSIS');
  console.log('Deep dive into all statistics and KPI endpoints for branch customer data');
  console.log('=' .repeat(80));

  // Authenticate
  const token = await authenticate();
  if (!token) {
    console.log('❌ Cannot proceed without authentication');
    process.exit(1);
  }

  console.log(`\\n🚀 Testing ${STATS_KPI_ENDPOINTS.length} stats and KPI endpoints...`);
  console.log('-'.repeat(60));

  const perfectMatches = [];
  const partialMatches = [];
  const successfulEndpoints = [];

  // Test all stats and KPI endpoints
  for (const endpoint of STATS_KPI_ENDPOINTS) {
    const result = await testStatsEndpoint(endpoint, token);
    
    if (result.success) {
      successfulEndpoints.push(result);
      
      if (result.analysis?.hasBranchCustomerCounts) {
        perfectMatches.push(result);
      } else if (result.analysis?.hasBranchData || result.analysis?.hasCustomerData) {
        partialMatches.push(result);
      }
    }

    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Final summary
  console.log('\\n\\n🎯 STATS & KPI ANALYSIS RESULTS');
  console.log('=' .repeat(80));
  console.log(`Total stats/KPI endpoints tested: ${STATS_KPI_ENDPOINTS.length}`);
  console.log(`Successful responses: ${successfulEndpoints.length}`);
  console.log(`Perfect matches (branch + customer counts): ${perfectMatches.length}`);
  console.log(`Partial matches (branch or customer data): ${partialMatches.length}`);

  if (perfectMatches.length > 0) {
    console.log('\\n🎉 PERFECT MATCHES FOUND IN STATS/KPI ENDPOINTS!');
    console.log('These endpoints return branch data with customer counts:');
    perfectMatches.forEach(match => {
      console.log(`\\n✅ ${match.name}`);
      console.log(`   📍 ${match.path}`);
      console.log(`   📊 ${match.analysis.summary}`);
      console.log(`   🏗️ ${match.analysis.structure}`);
      console.log(`   🔑 Branch Data: ${match.analysis.branchDataKeys.join(', ')}`);
      console.log(`   💡 This could replace the N+1 query pattern!`);
    });
  }

  if (partialMatches.length > 0) {
    console.log('\\n⚠️ PARTIAL MATCHES IN STATS/KPI ENDPOINTS:');
    partialMatches.forEach(match => {
      console.log(`   • ${match.name} (${match.path})`);
      console.log(`     ${match.analysis.summary}`);
      if (match.analysis.branchDataKeys.length > 0) {
        console.log(`     Keys: ${match.analysis.branchDataKeys.join(', ')}`);
      }
    });
  }

  if (perfectMatches.length === 0) {
    console.log('\\n❌ NO PERFECT MATCHES FOUND IN STATS/KPI ENDPOINTS');
    console.log('\\nKey findings:');
    console.log('• Dashboard KPI endpoint contains branch-related data but no customer counts');
    console.log('• Most stats endpoints return 404 (not implemented)');
    console.log('• No aggregated branch customer statistics available');
  }

  console.log('\\n🏁 Stats & KPI analysis complete!');
}

// Run the comprehensive stats analysis
main().catch(console.error);