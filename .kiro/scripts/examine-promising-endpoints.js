#!/usr/bin/env node

/**
 * Detailed examination of promising branch endpoints
 * Focus on the endpoints that returned branch data
 */

const https = require('https');

const BASE_URL = 'https://kaytop-production.up.railway.app';
const CREDENTIALS = {
  email: 'admin@kaytop.com',
  password: 'Admin123',
  userType: 'admin'
};

// Most promising endpoints to examine in detail
const PROMISING_ENDPOINTS = [
  { name: 'Dashboard KPI', path: '/dashboard/kpi', method: 'GET' },
  { name: 'Users Grouped by Branch', path: '/admin/users?groupBy=branch', method: 'GET' },
  { name: 'Users with Branch Stats', path: '/admin/users?statistics=branch', method: 'GET' },
  { name: 'Users with Branch Counts', path: '/admin/users?counts=branch', method: 'GET' },
  { name: 'Current Users by Branch (Osogbo)', path: '/admin/users/branch/Osogbo', method: 'GET' },
  { name: 'Current Users by Branch (Ede)', path: '/admin/users/branch/Ede', method: 'GET' },
  { name: 'Current Users by Branch (Ikire)', path: '/admin/users/branch/Ikire', method: 'GET' },
  { name: 'Ratings Branch', path: '/ratings/branch/Osogbo', method: 'GET' }
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
 * Test a single endpoint and return detailed response
 */
async function examineEndpoint(endpoint, token) {
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
      body: response.body
    };
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
 * Analyze response structure for branch customer data
 */
function analyzeForBranchCustomerData(result) {
  if (!result.success || !result.body) {
    return { analysis: 'No data available', hasBranchCustomerData: false };
  }

  const body = result.body;
  let findings = [];
  let hasBranchCustomerData = false;

  console.log(`\\n🔍 ANALYZING: ${result.name}`);
  console.log(`📍 Endpoint: ${result.path}`);
  console.log(`📊 Status: ${result.statusCode}`);
  console.log(`📋 Data Type: ${Array.isArray(body) ? 'Array' : typeof body}`);
  
  if (Array.isArray(body)) {
    console.log(`📏 Array Length: ${body.length}`);
    
    if (body.length > 0) {
      const firstItem = body[0];
      console.log(`🔑 First Item Keys:`, Object.keys(firstItem));
      console.log(`📄 First Item Sample:`, JSON.stringify(firstItem, null, 2));
      
      // Check for branch and customer data
      const hasBranch = firstItem.branch || firstItem.branchName || firstItem.name;
      const hasCustomers = firstItem.customers || firstItem.customerCount || firstItem.totalCustomers;
      const hasUsers = firstItem.users || firstItem.userCount || firstItem.totalUsers;
      
      if (hasBranch && (hasCustomers || hasUsers)) {
        hasBranchCustomerData = true;
        findings.push('✅ PERFECT MATCH: Contains branch names with customer/user counts');
      } else if (hasBranch) {
        findings.push('⚠️ Has branch data but no customer counts');
      } else if (hasCustomers || hasUsers) {
        findings.push('⚠️ Has customer/user data but no branch association');
      }
    }
  } else if (typeof body === 'object') {
    console.log(`🔑 Object Keys:`, Object.keys(body));
    
    // Look for branch-related data in the object
    for (const [key, value] of Object.entries(body)) {
      if (key.toLowerCase().includes('branch') && Array.isArray(value)) {
        console.log(`🎯 Found branch array in '${key}':`, value.length, 'items');
        if (value.length > 0) {
          console.log(`📄 Sample item:`, JSON.stringify(value[0], null, 2));
          
          const firstItem = value[0];
          const hasCustomers = firstItem.customers || firstItem.customerCount || firstItem.totalCustomers;
          const hasUsers = firstItem.users || firstItem.userCount || firstItem.totalUsers;
          
          if (hasCustomers || hasUsers) {
            hasBranchCustomerData = true;
            findings.push(`✅ PERFECT MATCH: Branch array '${key}' contains customer/user counts`);
          } else {
            findings.push(`⚠️ Branch array '${key}' exists but no customer counts`);
          }
        }
      } else if (key.toLowerCase().includes('customer') || key.toLowerCase().includes('user')) {
        console.log(`👥 Found customer/user data in '${key}':`, typeof value, Array.isArray(value) ? value.length + ' items' : '');
      }
    }
    
    // Special handling for dashboard KPI structure
    if (body.branches || body.totalBranches) {
      findings.push('🏢 Contains branch count information');
    }
    if (body.customers || body.totalCustomers) {
      findings.push('👥 Contains customer count information');
    }
    if (body.officerPerformance && Array.isArray(body.officerPerformance)) {
      console.log(`👮 Officer Performance Data:`, body.officerPerformance.length, 'items');
      if (body.officerPerformance.length > 0) {
        console.log(`📄 Officer Sample:`, JSON.stringify(body.officerPerformance[0], null, 2));
      }
    }
  }

  console.log(`🎯 Analysis:`, findings.join(', ') || 'No relevant structure found');
  console.log(`✅ Has Branch Customer Data:`, hasBranchCustomerData);
  
  return {
    analysis: findings.join(', ') || 'No relevant structure found',
    hasBranchCustomerData,
    findings
  };
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 DETAILED EXAMINATION OF PROMISING BRANCH ENDPOINTS');
  console.log('=' .repeat(70));

  // Authenticate
  const token = await authenticate();
  if (!token) {
    console.log('❌ Cannot proceed without authentication');
    process.exit(1);
  }

  const perfectMatches = [];
  const partialMatches = [];

  // Examine each promising endpoint
  for (const endpoint of PROMISING_ENDPOINTS) {
    const result = await examineEndpoint(endpoint, token);
    const analysis = analyzeForBranchCustomerData(result);
    
    if (analysis.hasBranchCustomerData) {
      perfectMatches.push({ ...result, analysis });
    } else if (analysis.findings.length > 0) {
      partialMatches.push({ ...result, analysis });
    }

    console.log('\\n' + '-'.repeat(70));
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // Summary
  console.log('\\n\\n🎯 FINAL ANALYSIS SUMMARY');
  console.log('=' .repeat(70));
  
  if (perfectMatches.length > 0) {
    console.log(`\\n✅ PERFECT MATCHES (${perfectMatches.length}):`);
    console.log('These endpoints return branch data with customer counts:');
    perfectMatches.forEach(match => {
      console.log(`\\n🎯 ${match.name}`);
      console.log(`   📍 ${match.path}`);
      console.log(`   📊 ${match.analysis.analysis}`);
      console.log(`   💡 This endpoint could replace the current N+1 query pattern!`);
    });
  }

  if (partialMatches.length > 0) {
    console.log(`\\n⚠️ PARTIAL MATCHES (${partialMatches.length}):`);
    console.log('These endpoints have some relevant data but may need processing:');
    partialMatches.forEach(match => {
      console.log(`\\n📋 ${match.name}`);
      console.log(`   📍 ${match.path}`);
      console.log(`   📊 ${match.analysis.analysis}`);
    });
  }

  if (perfectMatches.length === 0) {
    console.log('\\n❌ NO PERFECT MATCHES FOUND');
    console.log('The current N+1 query pattern (fetch branches, then users for each) appears to be the only option.');
    console.log('Consider requesting a backend endpoint that returns branch statistics directly.');
  }

  console.log('\\n🏁 Detailed examination complete!');
}

// Run the examination
main().catch(console.error);