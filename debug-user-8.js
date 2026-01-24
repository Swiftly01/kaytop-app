// Debug script to check user 8 data and test updates
import axios from 'axios';

const baseUrl = 'https://kaytop-production.up.railway.app';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGtheXRvcC5jb20iLCJzdWIiOjEsInJvbGUiOiJzeXN0ZW1fYWRtaW4iLCJpYXQiOjE3Mzc2MzE4NzV9.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

async function debugUser8() {
  try {
    console.log('=== Debugging User 8 ===\n');
    
    // 1. Check if we can authenticate
    console.log('1. Testing authentication with admin profile...');
    try {
      const profileResponse = await axios.get(`${baseUrl}/admin/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Authentication successful');
      console.log('Current user:', profileResponse.data);
    } catch (error) {
      console.log('❌ Authentication failed:', error.response?.status, error.response?.data);
      return;
    }
    
    // 2. Get user 8 data
    console.log('\n2. Getting user 8 data...');
    let user8Data = null;
    try {
      const getResponse = await axios.get(`${baseUrl}/admin/users/8`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      user8Data = getResponse.data;
      console.log('✅ User 8 found');
      console.log('User 8 data:', JSON.stringify(user8Data, null, 2));
    } catch (error) {
      console.log('❌ Failed to get user 8:', error.response?.status, error.response?.data);
      
      // Try to get a list of users to see what IDs are available
      console.log('\n2b. Getting list of users to see available IDs...');
      try {
        const usersResponse = await axios.get(`${baseUrl}/admin/users?limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Available users:', usersResponse.data);
      } catch (listError) {
        console.log('❌ Failed to get users list:', listError.response?.status, listError.response?.data);
      }
      return;
    }
    
    // 3. Test minimal update
    console.log('\n3. Testing minimal update (just firstName)...');
    try {
      const minimalUpdate = {
        firstName: user8Data.firstName || 'John'
      };
      
      console.log('Sending minimal update:', minimalUpdate);
      
      const updateResponse = await axios.patch(`${baseUrl}/admin/users/8`, minimalUpdate, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Minimal update successful!');
      console.log('Response:', JSON.stringify(updateResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Minimal update failed:', error.response?.status);
      console.log('Error data:', JSON.stringify(error.response?.data, null, 2));
      console.log('Request config:', {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data,
        headers: error.config?.headers
      });
    }
    
    // 4. Test with original data (no changes)
    console.log('\n4. Testing update with original data (no changes)...');
    try {
      const originalUpdate = {
        firstName: user8Data.firstName,
        lastName: user8Data.lastName,
        email: user8Data.email,
        mobileNumber: user8Data.mobileNumber || user8Data.phone
      };
      
      console.log('Sending original data update:', originalUpdate);
      
      const originalResponse = await axios.patch(`${baseUrl}/admin/users/8`, originalUpdate, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Original data update successful!');
      console.log('Response:', JSON.stringify(originalResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Original data update failed:', error.response?.status);
      console.log('Error data:', JSON.stringify(error.response?.data, null, 2));
    }
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

debugUser8();