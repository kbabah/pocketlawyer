// Simple script to test the Lawyer APIs
async function testLawyerAPIs() {
  try {
    console.log('🧪 Testing Lawyer APIs...\n');
    
    const baseUrl = 'http://localhost:3000/api';
    
    // 1. List all lawyers
    console.log('1. Testing GET /api/lawyers');
    const lawyersResponse = await fetch(`${baseUrl}/lawyers`);
    const lawyersData = await lawyersResponse.json();
    console.log(`Status: ${lawyersResponse.status} ${lawyersResponse.statusText}`);
    console.log(`Found ${lawyersData.lawyers?.length || 0} lawyers`);
    console.log('------------------------------\n');
    
    if (lawyersData.lawyers?.length > 0) {
      const firstLawyerId = lawyersData.lawyers[0].id;
      
      // 2. Get a specific lawyer
      console.log(`2. Testing GET /api/lawyers/${firstLawyerId}`);
      const singleLawyerResponse = await fetch(`${baseUrl}/lawyers/${firstLawyerId}`);
      const singleLawyerData = await singleLawyerResponse.json();
      console.log(`Status: ${singleLawyerResponse.status} ${singleLawyerResponse.statusText}`);
      console.log(`Lawyer Name: ${singleLawyerData.name || 'N/A'}`);
      console.log('------------------------------\n');
    }
    
    // 3. Test the register endpoint (without actual data)
    console.log('3. Testing POST /api/lawyers/register (without auth, expected to fail)');
    try {
      const registerResponse = await fetch(`${baseUrl}/lawyers/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          name: 'Test Lawyer',
          email: 'test@example.com' 
        })
      });
      const registerData = await registerResponse.json();
      console.log(`Status: ${registerResponse.status} ${registerResponse.statusText}`);
      console.log('Response:', registerData);
    } catch (e) {
      console.log('Expected error (no auth):', e.message);
    }
    console.log('------------------------------\n');
    
    // 4. Test update endpoint (without auth, expected to fail)
    console.log('4. Testing PUT /api/lawyers/test-id/update (without auth, expected to fail)');
    try {
      const updateResponse = await fetch(`${baseUrl}/lawyers/test-id/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bio: 'Updated bio' })
      });
      const updateData = await updateResponse.json();
      console.log(`Status: ${updateResponse.status} ${updateResponse.statusText}`);
      console.log('Response:', updateData);
    } catch (e) {
      console.log('Expected error (no auth):', e.message);
    }
    console.log('------------------------------\n');
    
    console.log('✅ API testing completed!');
    console.log('Note: Some tests were expected to fail due to authentication requirements.');
    console.log('To fully test authenticated endpoints, you would need a valid Firebase auth token.');
    
  } catch (error) {
    console.error('❌ Error testing APIs:', error);
  }
}

// Execute the tests when running in a browser or Node environment
if (typeof window !== 'undefined') {
  // Browser environment
  window.addEventListener('DOMContentLoaded', testLawyerAPIs);
} else {
  // Node.js environment
  testLawyerAPIs();
}