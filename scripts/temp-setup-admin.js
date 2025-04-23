const admin = require('firebase-admin');

// Initialize Firebase Admin with your service account from service-account.json
const serviceAccount = require('../service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const SUPER_ADMIN_UID = 'IDsUcYAf2MhhJ4NlsfdKayE6VkI2';

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