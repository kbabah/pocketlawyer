const admin = require('firebase-admin');

// Initialize Firebase Admin with environment variables
const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  })
});

// Replace with the Firebase Auth UID of the user you want to make a super admin
const SUPER_ADMIN_UID = process.argv[2];

if (!SUPER_ADMIN_UID) {
  console.error('Please provide the user ID as an argument');
  console.error('Usage: node setup-admin.js USER_ID');
  process.exit(1);
}

async function setupSuperAdmin() {
  try {
    // First verify the user exists
    const user = await admin.auth().getUser(SUPER_ADMIN_UID);
    console.log(`Setting up super admin for user: ${user.email}`);

    // Set custom claims
    await admin.auth().setCustomUserClaims(SUPER_ADMIN_UID, {
      admin: true,
      superAdmin: true
    });

    console.log('Successfully set up super admin');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up super admin:', error);
    process.exit(1);
  }
}

setupSuperAdmin();