/**
 * Diagnostic script to check customer data from API
 * Run this in browser console to see what's being returned
 */

// Add this to your browser console when on the dashboard page
async function diagnoseCustomers() {
  try {
    console.log('🔍 Fetching users from API...');
    
    // Get auth token from localStorage
    const token = localStorage.getItem('auth-token');
    if (!token) {
      console.error('❌ No auth token found');
      return;
    }
    
    // Fetch users
    const response = await fetch('http://localhost:3000/api/admin/users?limit=100', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('📦 Raw API Response:', data);
    
    // Extract users array
    const users = data.data || data;
    console.log(`📊 Total users returned: ${users.length}`);
    
    // Group by role
    const roleGroups = {};
    users.forEach(user => {
      const role = user.role || 'undefined';
      if (!roleGroups[role]) {
        roleGroups[role] = [];
      }
      roleGroups[role].push(user);
    });
    
    console.log('👥 Users grouped by role:');
    Object.entries(roleGroups).forEach(([role, users]) => {
      console.log(`  - ${role}: ${users.length} users`);
      console.log(`    Sample:`, users[0]);
    });
    
    // Check for customers specifically
    const customers = users.filter(u => u.role === 'customer');
    console.log(`\n🎯 Customers (role === 'customer'): ${customers.length}`);
    
    // Check for other possible customer role values
    const possibleCustomers = users.filter(u => 
      u.role && (
        u.role.toLowerCase().includes('customer') ||
        u.role.toLowerCase().includes('client') ||
        u.role.toLowerCase().includes('user')
      )
    );
    console.log(`🔍 Possible customers (fuzzy match): ${possibleCustomers.length}`);
    
    return {
      totalUsers: users.length,
      roleGroups,
      customers,
      possibleCustomers
    };
    
  } catch (error) {
    console.error('❌ Error diagnosing customers:', error);
  }
}

// Run the diagnostic
diagnoseCustomers();
