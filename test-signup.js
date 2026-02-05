// Test Firebase Auth Signup
const testSignup = async () => {
  try {
    const response = await fetch('http://localhost:3001/sign-up');
    console.log('Sign-up page status:', response.status);
    
    // Test the actual Firebase signup - we need to check browser console
    console.log('\n=== Firebase Configuration Check ===');
    console.log('Firebase API Key exists:', !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
    console.log('Firebase Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
    console.log('Firebase Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    
  } catch (error) {
    console.error('Error:', error);
  }
};

testSignup();
