const fetch = require('node-fetch');

async function testConsultationAPIs() {
  try {
    console.log('🧪 Testing Consultation APIs...\n');
    
    const baseUrl = 'http://localhost:3000/api';
    
    // 1. Test GET consultations (unauthorized)
    console.log('1. Testing GET /api/consultations (without auth)');
    const unauthorizedResponse = await fetch(`${baseUrl}/consultations`);
    console.log(`Status: ${unauthorizedResponse.status}`);
    console.log('Response:', await unauthorizedResponse.json());
    console.log('------------------------------\n');

    // 2. Test POST consultations (unauthorized)
    console.log('2. Testing POST /api/consultations (without auth)');
    const bookingData = {
      lawyerId: 'test-lawyer-id',
      date: '2025-04-25',
      timeSlot: {
        start: '10:00',
        end: '11:00'
      },
      consultationType: 'video',
      timezone: 'UTC',
      additionalInfo: 'Test consultation booking'
    };

    const bookingResponse = await fetch(`${baseUrl}/consultations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    
    console.log(`Status: ${bookingResponse.status}`);
    console.log('Response:', await bookingResponse.json());
    console.log('------------------------------\n');

    console.log('✅ Consultation API testing completed!');
    
  } catch (error) {
    console.error('❌ Error testing consultation APIs:', error);
  }
}

// Execute the tests
async function runTests() {
  console.log('Starting API tests...\n');
  await testConsultationAPIs();
  console.log('\nAll API tests completed!');
}

// Run tests
runTests();