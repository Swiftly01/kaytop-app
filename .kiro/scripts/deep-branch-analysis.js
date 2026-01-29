#!/usr/bin/env node

/**
 * Deep Branch Statistics Analysis
 * Focus on finding aggregated branch statistics that could replace N+1 queries
 */

const https = require('https');

const BASE_URL = 'https://kaytop-production.up.railway.app';
const CREDENTIALS = {
  email: 'admin@kaytop.com',
  password: 'Admin123',
  userType: 'admin'
};

// Additional endpoints to test based on the API structure
const ADDITIONAL_ENDPOINTS = [
  // Dashboard variations
  { name: 'Dashboard Branches', path: '/dashboard/branches', method: 'GET' },
  { name: 'Dashboard Statistics', path: '/dashboard/statistics', method: 'GET' },
  { name: 'Dashboard Analytics', path: '/dashboard/analytics', method: 'GET' },
  { name: 'Dashboard Summary', path: '/dashboard/summary', method: 'GET' },
  
  // Admin statistics variations
  { name: 'Admin Statistics', path: '/admin/statistics', method: 'GET' },
  { name: 'Admin Analytics', path: '/admin/analytics', method: 'GET' },
  { name: 'Admin Summary', path: '/admin/summary', method: 'GET' },
  { name: 'Admin Overview', path: '/admin/overview', method: 'GET' },
  
  // Users with different parameters
  { name: 'Users Summary', path: '/admin/users/summary', method: 'GET' },
  { name: 'Users Statistics', path: '/admin/users/statistics', method: 'GET' },
  { name: 'Users Analytics', path: '/admin/users/analytics', method: 'GET' },
  { name: 'Users Overview', path: '/admin/users/overview', method: 'GET' },
  
  // Branch-specific aggregations
  { name: 'Users by Branch Summary', path: '/admin/users/branch-summary', method: 'GET' },
  { name: 'Users by Branch Statistics', path: '/admin/users/branch-statistics', method: 'GET' },
  { name: 'Users by Branch Analytics', path: '/admin/users/branch-analytics', method: 'GET' },
  
  // Potential aggregation endpoints
  { name: 'Aggregations Branches', path: '/aggregations/branches', method: 'GET' },
  { name: 'Reports Branches', path: '/reports/branches', method: 'GET' },
  { name: 'Metrics Users by Branch', path: '/metrics/users/branch', method: 'GET' },
  
  // Different query parameter combinations
  { name: 'Users with Aggregation', path: '/admin/users?aggregate=branch', method: 'GET' },
  { name: 'Users with Summary', path: '/admin/users?summary=branch', method: 'GET' },
  { name: 'Users with Metrics', path: '/admin/users?metrics=branch', method: 'GET' },
  { name: 'Users with Count by Branch', path: '/admin/users?count=branch', method: 'GET' },
  
  // Test all branches endpoint variations
  { name: 'All Branches', path: '/branches', method: 'GET' },
  { name: 'Branches List', path: '/branches/list', method: 'GET' },
  { name: 'Branches All', path: '/branches/all', method: 'GET' },
  
  // Test specific branch endpoints that might return aggregated data
  { name: 'Branch Osogbo Stats', path: '/branch/Osogbo/statistics', method: 'GET' },
  { name: 'Branch Osogbo Summary', path: '/branch/Osogbo/summary', method: 'GET' },
  { name: 'Branch Osogbo Users', path: '/branch/Osogbo/users', method: 'GET' }
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
async function testAndAnalyze(endpoint, token) {
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
      const analysis = analyzeBranchCustomerData(result.body);
      result.analysis = analysis;
      
      if (analysis.hasBranchCustomerCounts) {
        console.log(`🎯 JACKPOT! ${result.name} (${result.path})`);
        console.log(`   📊 ${analysis.summary}`);
        console.log(`   📋 Structure: ${analysis.structure}`);
        if (analysis.sampleData) {
          console.log(`   📄 Sample:`, JSON.stringify(analysis.sampleData, null, 2).substring(0, 300) + '...');
        }
        console.log('');
      } else if (analysis.hasBranchData || analysis.hasCustomerData) {
        console.log(`⚠️ Partial: ${result.name} - ${analysis.summary}`);
      }
    } else if (result.statusCode === 404) {
      // Silent for 404s to reduce noise
    } else {
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
 * Analyze response for branch customer data
 */
function analyzeBranchCustomerData(body) {
  let hasBranchData = false;
  let hasCustomerData = false;
  let hasBranchCustomerCounts = false;
  let structure = '';
  let summary = '';
  let sampleData = null;

  if (Array.isArray(body)) {
    structure = `Array[${body.length}]`;
    
    if (body.length > 0) {
      const firstItem = body[0];
      sampleData = firstItem;
      
      // Check for branch data
      if (firstItem.branch || firstItem.branchName || firstItem.name) {
        hasBranchData = true;
      }
      
      // Check for customer counts
      if (firstItem.customers || firstItem.customerCount || firstItem.totalCustomers || 
          firstItem.userCount || firstItem.totalUsers) {
        hasCustomerData = true;
      }
      
      // Perfect match: branch + customer counts
      if (hasBranchData && hasCustomerData) {
        hasBranchCustomerCounts = true;
        summary = 'Array with branch names and customer counts';
      } else if (hasBranchData) {
        summary = 'Array with branch data (no customer counts)';
      } else if (hasCustomerData) {
        summary = 'Array with customer data (no branch association)';
      }
    }
  } else if (typeof body === 'object' && body !== null) {
    const keys = Object.keys(body);
    structure = `Object{${keys.length} keys}`;
    
    // Look for branch-related arrays or objects
    for (const [key, value] of Object.entries(body)) {
      if (key.toLowerCase().includes('branch') && Array.isArray(value)) {
        hasBranchData = true;
        
        if (value.length > 0) {
          const firstItem = value[0];
          sampleData = { [key]: firstItem };
          
          // Check if branch items have customer counts
          if (firstItem.customers || firstItem.customerCount || firstItem.totalCustomers ||
              firstItem.userCount || firstItem.totalUsers) {
            hasCustomerData = true;
            hasBranchCustomerCounts = true;
            summary = `Object with branch array '${key}' containing customer counts`;
            break;
          }
        }
      }
      
      // Check for aggregated branch statistics
      if ((key.toLowerCase().includes('branch') && key.toLowerCase().includes('stat')) ||
          (key.toLowerCase().includes('branch') && key.toLowerCase().includes('count')) ||
          (key.toLowerCase().includes('branch') && key.toLowerCase().includes('summary'))) {
        hasBranchData = true;
        hasCustomerData = true;
        sampleData = { [key]: value };
        summary = `Object with branch statistics in '${key}'`;
      }
    }
    
    // Check for general branch/customer indicators
    if (!hasBranchData && keys.some(k => k.toLowerCase().includes('branch'))) {
      hasBranchData = true;
    }
    if (!hasCustomerData && keys.some(k => k.toLowerCase().includes('customer') || k.toLowerCase().includes('user'))) {
      hasCustomerData = true;
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
    sampleData
  };
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 DEEP BRANCH STATISTICS ANALYSIS');
  console.log('Searching for aggregated branch customer count endpoints...');
  console.log('=' .repeat(70));

  // Authenticate
  const token = await authenticate();
  if (!token) {
    console.log('❌ Cannot proceed without authentication');
    process.exit(1);
  }

  console.log('\\n🚀 Testing additional endpoints...');
  console.log('-'.repeat(50));

  const perfectMatches = [];
  const partialMatches = [];
  const successfulEndpoints = [];

  // Test all additional endpoints
  for (const endpoint of ADDITIONAL_ENDPOINTS) {
    const result = await testAndAnalyze(endpoint, token);
    
    if (result.success) {
      successfulEndpoints.push(result);
      
      if (result.analysis?.hasBranchCustomerCounts) {
        perfectMatches.push(result);
      } else if (result.analysis?.hasBranchData || result.analysis?.hasCustomerData) {
        partialMatches.push(result);
      }
    }

    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Final summary
  console.log('\\n\\n🎯 DEEP ANALYSIS RESULTS');
  console.log('=' .repeat(70));
  console.log(`Total endpoints tested: ${ADDITIONAL_ENDPOINTS.length}`);
  console.log(`Successful responses: ${successfulEndpoints.length}`);
  console.log(`Perfect matches (branch + customer counts): ${perfectMatches.length}`);
  console.log(`Partial matches (branch or customer data): ${partialMatches.length}`);

  if (perfectMatches.length > 0) {
    console.log('\\n🎉 PERFECT MATCHES FOUND!');
    console.log('These endpoints return branch data with customer counts:');
    perfectMatches.forEach(match => {
      console.log(`\\n✅ ${match.name}`);
      console.log(`   📍 ${match.path}`);
      console.log(`   📊 ${match.analysis.summary}`);
      console.log(`   🏗️ ${match.analysis.structure}`);
      console.log(`   💡 This could replace the N+1 query pattern!`);
    });
  }

  if (partialMatches.length > 0) {
    console.log('\\n⚠️ PARTIAL MATCHES:');
    partialMatches.forEach(match => {
      console.log(`   • ${match.name} (${match.path}) - ${match.analysis.summary}`);
    });
  }

  if (perfectMatches.length === 0) {
    console.log('\\n❌ NO PERFECT MATCHES FOUND');
    console.log('\\nRecommendations:');
    console.log('1. The current N+1 pattern (fetch branches, then users per branch) is the only option');
    console.log('2. Consider requesting a backend endpoint like:');
    console.log('   GET /admin/branches/statistics');
    console.log('   GET /admin/users/branch-summary');
    console.log('   GET /dashboard/branch-metrics');
    console.log('3. Or modify existing endpoints to include customer counts');
  }

  console.log('\\n🏁 Deep analysis complete!');
}

// Run the deep analysis
main().catch(console.error);