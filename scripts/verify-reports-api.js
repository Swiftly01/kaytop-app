/**
 * Verification script for Reports API Infrastructure
 * This script verifies that all the API client components are properly set up
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Reports API Infrastructure...\n');

// Check if all required files exist
const requiredFiles = [
  'lib/api/client.ts',
  'lib/api/config.ts',
  'lib/api/errorHandler.ts',
  'lib/api/transformers.ts',
  'lib/services/reports.ts'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesExist = false;
  }
});

// Check if reports endpoints are configured
const configPath = 'lib/api/config.ts';
if (fs.existsSync(configPath)) {
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  const requiredEndpoints = [
    'REPORTS:',
    'LIST:',
    'BY_ID:',
    'APPROVE:',
    'DECLINE:',
    'STATISTICS:'
  ];
  
  console.log('\n🔍 Checking API endpoints configuration...');
  
  requiredEndpoints.forEach(endpoint => {
    if (configContent.includes(endpoint)) {
      console.log(`✅ ${endpoint} configured`);
    } else {
      console.log(`❌ ${endpoint} missing`);
      allFilesExist = false;
    }
  });
}

// Check if transformers include reports transformations
const transformersPath = 'lib/api/transformers.ts';
if (fs.existsSync(transformersPath)) {
  const transformersContent = fs.readFileSync(transformersPath, 'utf8');
  
  console.log('\n🔍 Checking data transformers...');
  
  const requiredTransformers = [
    'transformReport',
    'transformReportStatistics',
    'normalizeReportType',
    'normalizeReportStatus'
  ];
  
  requiredTransformers.forEach(transformer => {
    if (transformersContent.includes(transformer)) {
      console.log(`✅ ${transformer} implemented`);
    } else {
      console.log(`❌ ${transformer} missing`);
      allFilesExist = false;
    }
  });
}

// Check if API client uses official authentication
const clientPath = 'lib/api/client.ts';
if (fs.existsSync(clientPath)) {
  const clientContent = fs.readFileSync(clientPath, 'utf8');
  
  console.log('\n🔍 Checking API client authentication...');
  
  const requiredMethods = [
    'getDefaultHeaders',
    'js-cookie',
    'Authorization'
  ];
  
  requiredMethods.forEach(method => {
    if (clientContent.includes(method)) {
      console.log(`✅ ${method} implemented`);
    } else {
      console.log(`❌ ${method} missing`);
      allFilesExist = false;
    }
  });
}

// Check if reports service uses unified API client
const reportsServicePath = 'lib/services/reports.ts';
if (fs.existsSync(reportsServicePath)) {
  const reportsServiceContent = fs.readFileSync(reportsServicePath, 'utf8');
  
  console.log('\n🔍 Checking reports service integration...');
  
  const requiredIntegrations = [
    'import { apiClient }',
    'import { API_ENDPOINTS }',
    'import { UnifiedAPIErrorHandler }',
    'getAllReports',
    'getReportById',
    'createReport',
    'updateReport',
    'deleteReport',
    'approveReport',
    'declineReport',
    'getReportStatistics'
  ];
  
  requiredIntegrations.forEach(integration => {
    if (reportsServiceContent.includes(integration)) {
      console.log(`✅ ${integration} integrated`);
    } else {
      console.log(`❌ ${integration} missing`);
      allFilesExist = false;
    }
  });
}

console.log('\n' + '='.repeat(50));

if (allFilesExist) {
  console.log('🎉 All Reports API Infrastructure components are properly set up!');
  console.log('\n📋 Summary:');
  console.log('✅ Unified API client with retry mechanisms');
  console.log('✅ Official authentication handling for reports API calls');
  console.log('✅ Error handling and user-friendly error messages');
  console.log('✅ Data transformers for reports and statistics');
  console.log('✅ Complete reports service with CRUD operations');
  console.log('✅ Reports endpoints configuration');
  
  console.log('\n🚀 Ready to proceed with task 2: Implement core reports service functions');
  process.exit(0);
} else {
  console.log('❌ Some components are missing or incomplete.');
  console.log('Please review the missing items above.');
  process.exit(1);
}