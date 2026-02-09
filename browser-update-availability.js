// Copy this code and paste in browser console to update lawyer availability

const availability = {
  monday: { available: true, hours: ['09:00', '11:00', '13:00'] },
  tuesday: { available: true, hours: ['09:00', '11:00', '13:00'] },
  wednesday: { available: true, hours: ['09:00', '11:00', '13:00'] },
  thursday: { available: true, hours: ['09:00', '11:00', '13:00'] },
  friday: { available: true, hours: ['09:00', '11:00', '13:00'] },
  saturday: { available: false, hours: [] },
  sunday: { available: false, hours: [] }
};

// Get Firestore from Firebase
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { app } from './lib/firebase';

const db = getFirestore(app);
const lawyerRef = doc(db, 'lawyers', 'n07jUGK7JblxZEGJTYmR');

updateDoc(lawyerRef, {
  availability: availability,
  updatedAt: new Date()
}).then(() => {
  console.log('✅ Lawyer availability updated!');
  console.log('Refresh the page to see changes.');
}).catch((error) => {
  console.error('❌ Error updating availability:', error);
});
