#!/usr/bin/env node

/**
 * Branch Endpoint Investigation Script
 * Systematically tests all potential endpoints that might return branch customer count data
 */

const https = require('https');

const BASE_URL = 'https://kaytop-production.up.railway.app';
const CREDENTIALS = {
  email: 'admin@kaytop.com',
  password: 'Admin123',
  userType: 'admin'
};

// List of endpoints to test
const ENDPOINTS_TO_TEST = [
  // Current endpoints (baseline)
  { name: 'Current Branches', path: '/users/branches', method: 'GET' },
  { name: 'Current Users by Branch', path: '/admin/users/branch/Osogbo', method: 'GET' },
  
  // Most promising endpoints
  { name: 'Admin Branches', path: '/admin/branches', method: 'GET' },
  { name: 'Dashboard KPI', path: '/dashboard/kpi', method: 'GET' },
  
  // Potential statistics endpoints
  { name: 'Branch Statistics', path: '/admin/branches/statistics', method: 'GET' },
  { name: 'Branch Summary', path: '/admin/branches/summary', method: 'GET' },
  { name: 'Branch Performance', path: '/admin/branches/performance', method: 'GET' },
  { name: 'Branch Analytics', path: '/admin/branches/analytics', method: 'GET' },
  { name: 'Branch Overview', path: '/admin/branches/overview', method: 'GET' },
  { name: 'Branch Metrics', path: '/admin/branches/metrics', method: 'GET' },
  
  // Query parameter variations
  { name: 'Branches with Statistics', path: '/admin/branches?include=statistics', method: 'GET' },
  { name: 'Branches with Users', path: '/admin/branches?include=users', method: 'GET' },
  { name: 'Branches with Counts', path: '/admin/branches?include=counts', method: 'GET' },
  
  // User endpoint variations
  { name: 'Users Grouped by Branch', path: '/admin/users?groupBy=branch', method: 'GET' },
  { name: 'Users with Branch Stats', path: '/admin/users?statistics=branch', method: 'GET' },
  { name: 'Users with Branch Counts', path: '/admin/users?counts=branch', method: 'GET' },
  
  // Other potential endpoints
  { name: 'Ratings Branch', path: '/ratings/branch/Osogbo', method: 'GET' },
  { name: 'Reports by Branch', path: '/reports/branch/Osogbo', method: 'GET' },
  { name: 'Analytics Branches', path: '/analytics/branches', method: 'GET' },
  { name: 'Statistics Branches', path: '/statistics/branches', method: 'GET' },
  { name: 'Metrics Branches', path: '/metrics/branches', method: 'GET' },
  { name: 'Unified Branch Data', path: '/api/branches/data', method: 'GET' },
  { name: 'V1 Branch Statistics', path: '/api/v1/branches/statistics', method: 'GET' }
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
      } else {
        console.log('❌ No access token in response:', response.body);
        return null;
      }
    } else {
      console.log('❌ Authentication failed:', response.statusCode, response.body);
      return null;
    }
  } catch (error) {
    console.log('❌ Authentication error:', error.message);
    return null;
  }
}

/**
 * Test a single endpoint
 */
async function testEndpoint(endpoint, token) {
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
    
    return {
      name: endpoint.name,
      path: endpoint.path,
      statusCode: response.statusCode,
      success: response.statusCode >= 200 && response.statusCode < 300,
      hasData: response.body && (Array.isArray(response.body) || Object.keys(response.body).length > 0),
      dataType: Array.isArray(response.body) ? 'array' : typeof response.body,
      dataSize: Array.isArray(response.body) ? response.body.length : (response.body ? Object.keys(response.body).length : 0),
      body: response.body,
      error: response.statusCode >= 400 ? response.body : null
    };
  } catch (error) {
    return {
      name: endpoint.name,
      path: endpoint.path,
      statusCode: 0,
      success: false,
      error: error.message,
      hasData: false,
      dataType: 'error',
      dataSize: 0
    };
  }
}

/**
 * Analyze response for branch customer data
 */
function analyzeResponse(result) {
  if (!result.success || !result.body) {
    return { hasBranchData: false, hasCustomerCounts: false, analysis: 'No data' };
  }

  const body = result.body;
  let analysis = [];
  let hasBranchData = false;
  let hasCustomerCounts = false;

  // Check for branch-related data
  if (Array.isArray(body)) {
    if (body.length > 0) {
      const firstItem = body[0];
      if (firstItem.branch || firstItem.branchName || firstItem.name) {
        hasBranchData = true;
        analysis.push(`Array of ${body.length} items with branch data`);
      }
      if (firstItem.customers || firstItem.customerCount || firstItem.users) {
        hasCustomerCounts = true;
        analysis.push('Contains customer count data');
      }
    }
  } else if (typeof body === 'object') {
    // Check for branch data in object
    const keys = Object.keys(body);
    if (keys.some(key => key.toLowerCase().includes('branch'))) {
      hasBranchData = true;
      analysis.push('Contains branch-related keys');
    }
    if (keys.some(key => key.toLowerCase().includes('customer') || key.toLowerCase().includes('user'))) {
      hasCustomerCounts = true;
      analysis.push('Contains customer/user count data');
    }
    
    // Check for nested branch data
    for (const key of keys) {
      const value = body[key];
      if (Array.isArray(value) && value.length > 0) {
        const firstItem = value[0];
        if (firstItem && (firstItem.branch || firstItem.branchName || firstItem.customers)) {
          hasBranchData = true;
          hasCustomerCounts = firstItem.customers !== undefined;
          analysis.push(`Nested array in '${key}' with branch data`);
        }
      }
    }
  }

  return {
    hasBranchData,
    hasCustomerCounts,
    analysis: analysis.join(', ') || 'No relevant data structure'
  };
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Branch Endpoint Investigation');
  console.log('=' .repeat(60));

  // Authenticate
  const token = await authenticate();
  if (!token) {
    console.log('❌ Cannot proceed without authentication');
    process.exit(1);
  }

  console.log('\\n🔍 Testing endpoints...');
  console.log('=' .repeat(60));

  const results = [];
  const successfulEndpoints = [];
  const potentialBranchEndpoints = [];

  // Test each endpoint
  for (const endpoint of ENDPOINTS_TO_TEST) {
    console.log(`Testing: ${endpoint.name} (${endpoint.path})`);
    
    const result = await testEndpoint(endpoint, token);
    const analysis = analyzeResponse(result);
    
    result.analysis = analysis;
    results.push(result);

    // Log result
    const status = result.success ? '✅' : '❌';
    const dataInfo = result.hasData ? `(${result.dataType}, ${result.dataSize} items)` : '(no data)';
    console.log(`  ${status} ${result.statusCode} ${dataInfo}`);
    
    if (analysis.hasBranchData || analysis.hasCustomerCounts) {
      console.log(`  🎯 POTENTIAL MATCH: ${analysis.analysis}`);
      potentialBranchEndpoints.push(result);
    }

    if (result.success) {
      successfulEndpoints.push(result);
    }

    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary
  console.log('\\n📊 INVESTIGATION SUMMARY');
  console.log('=' .repeat(60));
  console.log(`Total endpoints tested: ${results.length}`);
  console.log(`Successful responses: ${successfulEndpoints.length}`);
  console.log(`Potential branch data endpoints: ${potentialBranchEndpoints.length}`);

  // Show successful endpoints
  console.log('\\n✅ SUCCESSFUL ENDPOINTS:');
  successfulEndpoints.forEach(result => {
    console.log(`  • ${result.name} (${result.statusCode}) - ${result.analysis.analysis}`);
  });

  // Show potential branch endpoints
  if (potentialBranchEndpoints.length > 0) {
    console.log('\\n🎯 POTENTIAL BRANCH DATA ENDPOINTS:');
    potentialBranchEndpoints.forEach(result => {
      console.log(`  • ${result.name} (${result.path})`);
      console.log(`    Status: ${result.statusCode}`);
      console.log(`    Analysis: ${result.analysis.analysis}`);
      console.log(`    Has Branch Data: ${result.analysis.hasBranchData}`);
      console.log(`    Has Customer Counts: ${result.analysis.hasCustomerCounts}`);
      if (result.body && Object.keys(result.body).length < 10) {
        console.log(`    Sample Data:`, JSON.stringify(result.body, null, 2).substring(0, 200) + '...');
      }
      console.log('');
    });
  }

  // Show failed endpoints for reference
  const failedEndpoints = results.filter(r => !r.success);
  if (failedEndpoints.length > 0) {
    console.log('\\n❌ FAILED ENDPOINTS:');
    failedEndpoints.forEach(result => {
      console.log(`  • ${result.name} (${result.statusCode}) - ${result.path}`);
    });
  }

  console.log('\\n🏁 Investigation complete!');
}

// Run the investigation
main().catch(console.error);