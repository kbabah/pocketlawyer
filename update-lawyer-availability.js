// Quick script to update lawyer availability
// Run with: GOOGLE_APPLICATION_CREDENTIALS=path/to/key.json node update-lawyer-availability.js

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize with environment-based credentials or application default
let app;
try {
  app = initializeApp();
} catch (error) {
  console.error('Using default credentials');
  app = initializeApp();
}

const db = getFirestore();

async function updateAvailability() {
  const lawyerId = 'n07jUGK7JblxZEGJTYmR';
  
  const availability = {
    monday: { available: true, hours: ['09:00', '11:00', '13:00'] },
    tuesday: { available: true, hours: ['09:00', '11:00', '13:00'] },
    wednesday: { available: true, hours: ['09:00', '11:00', '13:00'] },
    thursday: { available: true, hours: ['09:00', '11:00', '13:00'] },
    friday: { available: true, hours: ['09:00', '11:00', '13:00'] },
    saturday: { available: false, hours: [] },
    sunday: { available: false, hours: [] }
  };
  
  await db.collection('lawyers').doc(lawyerId).update({
    availability: availability,
    updatedAt: new Date()
  });
  
  console.log('✅ Lawyer availability updated successfully!');
  console.log('📅 Available: Monday-Friday');
  console.log('🕐 Time slots: 09:00, 11:00, 13:00');
  
  process.exit(0);
}

updateAvailability().catch(console.error);
