#!/usr/bin/env node

/**
 * Add test availability data for lawyer to enable booking testing
 * Run: node scripts/add-test-availability.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin with service account
const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function addTestAvailability() {
  const lawyerId = 'n07jUGK7JblxZEGJTYmR'; // Babah Kingsley
  
  // Create availability for next 30 days
  const today = new Date();
  const availabilityData = [];
  
  for (let i = 1; i <= 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Add 3 time slots per day (9:00, 11:00, 13:00)
    const timeSlots = ['09:00', '11:00', '13:00'];
    
    for (const time of timeSlots) {
      availabilityData.push({
        date: dateString,
        time: time,
        isAvailable: true,
        bookedBy: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  }
  
  console.log(`Adding ${availabilityData.length} availability slots for lawyer ${lawyerId}...`);
  
  const batch = db.batch();
  
  for (const slot of availabilityData) {
    const docRef = db.collection('lawyers').doc(lawyerId).collection('availability').doc();
    batch.set(docRef, slot);
  }
  
  await batch.commit();
  
  console.log('✅ Test availability added successfully!');
  console.log(`📅 Added slots for dates: ${availabilityData[0].date} to ${availabilityData[availabilityData.length - 1].date}`);
  console.log('🕐 Time slots: 09:00, 11:00, 13:00 (each day)');
  
  process.exit(0);
}

addTestAvailability().catch((error) => {
  console.error('❌ Error adding availability:', error);
  process.exit(1);
});
