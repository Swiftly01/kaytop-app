// Simple Node.js script to test the API update endpoint
import axios from 'axios';

const baseUrl = 'https://kaytop-production.up.railway.app';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGtheXRvcC5jb20iLCJzdWIiOjEsInJvbGUiOiJzeXN0ZW1fYWRtaW4iLCJpYXQiOjE3Mzc2MzE4NzV9.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

async function testUserUpdate() {
  try {
    console.log('Testing user update API...');
    
    // First, get the user to see current structure
    console.log('\n1. Getting user 8...');
    const getResponse = await axios.get(`${baseUrl}/admin/users/8`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Current user data:', JSON.stringify(getResponse.data, null, 2));
    
    // Test minimal update
    console.log('\n2. Testing minimal update...');
    const updateData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'johnomotosho2001@gmail.com',
      mobileNumber: '1234567890'
    };
    
    console.log('Sending update data:', JSON.stringify(updateData, null, 2));
    
    const updateResponse = await axios.patch(`${baseUrl}/admin/users/8`, updateData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Update successful!');
    console.log('Response:', JSON.stringify(updateResponse.data, null, 2));
    
  } catch (error) {
    console.error('Error occurred:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Response Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Request URL:', error.config?.url);
    console.error('Request Method:', error.config?.method);
    console.error('Request Data:', error.config?.data);
  }
}

testUserUpdate();