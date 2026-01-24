/**
 * Debug utility for credit officers data discrepancy
 * Can be called from browser console to investigate the issue
 */

import { unifiedUserService } from '../services/unifiedUser';
import { dashboardService } from '../services/dashboard';
import { accurateDashboardService } from '../services/accurateDashboard';

export async function debugCreditOfficersDiscrepancy() {
  console.log('🔍 Starting credit officers discrepancy debug...');
  
  try {
    // Clear all caches first
    console.log('🧹 Clearing all caches...');
    unifiedUserService.clearCache();
    accurateDashboardService.clearCache();
    
    // 1. Get data from unified user service (what the table shows)
    console.log('\n📋 1. Fetching credit officers from unified user service (table data)...');
    const tableData = await unifiedUserService.getUsers({ role: 'credit_officer' });
    const tableCreditOfficers = tableData.data;
    
    console.log(`   Table shows: ${tableCreditOfficers.length} credit officers`);
    console.log('   Table credit officers:', tableCreditOfficers.map(co => ({
      id: co.id,
      name: `${co.firstName} ${co.lastName}`,
      role: co.role,
      email: co.email
    })));
    
    // 2. Get data from dashboard service (what the card shows)
    console.log('\n📊 2. Fetching dashboard KPIs (card data)...');
    const dashboardData = await dashboardService.getKPIs();
    const cardCreditOfficersCount = dashboardData?.creditOfficers?.value || 0;
    
    console.log(`   Card shows: ${cardCreditOfficersCount} credit officers`);
    console.log('   Dashboard credit officers data:', dashboardData?.creditOfficers);
    
    // 3. Get raw data from /admin/staff/my-staff
    console.log('\n🔄 3. Fetching raw data from /admin/staff/my-staff...');
    const rawStaffData = await unifiedUserService.getUsers({ limit: 1000 }); // Get all users
    const allUsers = rawStaffData.data;
    
    console.log(`   Raw staff endpoint returns: ${allUsers.length} total users`);
    
    // Analyze role distribution
    const roleDistribution: Record<string, number> = {};
    allUsers.forEach(user => {
      const role = user.role || 'undefined';
      roleDistribution[role] = (roleDistribution[role] || 0) + 1;
    });
    
    console.log('   Role distribution:', roleDistribution);
    
    // Find all potential credit officers with different filtering logic
    const potentialCreditOfficers = allUsers.filter(user => {
      const userRole = user.role?.toLowerCase() || '';
      return userRole.includes('credit') || 
             userRole.includes('officer') ||
             userRole === 'co';
    });
    
    console.log(`   Potential credit officers (loose filter): ${potentialCreditOfficers.length}`);
    console.log('   Potential credit officers:', potentialCreditOfficers.map(co => ({
      id: co.id,
      name: `${co.firstName} ${co.lastName}`,
      role: co.role,
      email: co.email
    })));
    
    // 4. Check accurate dashboard service
    console.log('\n🎯 4. Checking accurate dashboard service...');
    const accurateData = await accurateDashboardService.getAccurateKPIs();
    const accurateCreditOfficersCount = accurateData?.creditOfficers?.value || 0;
    
    console.log(`   Accurate dashboard shows: ${accurateCreditOfficersCount} credit officers`);
    
    // 5. Summary and analysis
    console.log('\n📈 SUMMARY:');
    console.log(`   Table (unified service): ${tableCreditOfficers.length}`);
    console.log(`   Card (dashboard service): ${cardCreditOfficersCount}`);
    console.log(`   Accurate dashboard: ${accurateCreditOfficersCount}`);
    console.log(`   Raw staff endpoint: ${allUsers.length} total users`);
    console.log(`   Potential credit officers: ${potentialCreditOfficers.length}`);
    
    if (tableCreditOfficers.length !== cardCreditOfficersCount) {
      console.log('\n⚠️ DISCREPANCY DETECTED!');
      console.log('   Possible causes:');
      console.log('   1. Dashboard service uses different filtering logic');
      console.log('   2. Dashboard service uses cached data from different endpoint');
      console.log('   3. Role names in backend data don\'t match expected values');
      console.log('   4. Dashboard service counts users that table filters out');
      
      // Show the difference
      const difference = Math.abs(tableCreditOfficers.length - cardCreditOfficersCount);
      console.log(`   Difference: ${difference} credit officers`);
      
      if (cardCreditOfficersCount > tableCreditOfficers.length) {
        console.log('   💡 Dashboard shows MORE than table - check if dashboard includes users with different role names');
      } else {
        console.log('   💡 Table shows MORE than dashboard - check if table filtering is too loose');
      }
    } else {
      console.log('\n✅ No discrepancy found - counts match!');
    }
    
    return {
      tableCount: tableCreditOfficers.length,
      cardCount: cardCreditOfficersCount,
      accurateCount: accurateCreditOfficersCount,
      totalUsers: allUsers.length,
      potentialCount: potentialCreditOfficers.length,
      roleDistribution,
      tableCreditOfficers,
      potentialCreditOfficers
    };
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
    throw error;
  }
}

// Make it available globally for browser console
if (typeof window !== 'undefined') {
  (window as Window & { debugCreditOfficers?: typeof debugCreditOfficersDiscrepancy }).debugCreditOfficers = debugCreditOfficersDiscrepancy;
}