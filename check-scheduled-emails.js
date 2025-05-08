const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkScheduledEmails() {
  console.log('Checking scheduled emails...');
  const scheduledEmailsSnapshot = await db
    .collection('scheduledEmails')
    .where('status', '==', 'scheduled')
    .limit(10)
    .get();
  
  console.log();
  
  scheduledEmailsSnapshot.forEach(doc => {
    const email = doc.data();
    console.log(JSON.stringify({
      id: doc.id,
      to: email.to,
      subject: email.subject,
      status: email.status,
      scheduledFor: email.scheduledFor?.toDate(),
      createdAt: email.createdAt?.toDate()
    }, null, 2));
  });
  
  console.log('
Checking scheduled campaigns...');
  const campaignsSnapshot = await db
    .collection('emailCampaigns')
    .where('status', 'in', ['scheduled', 'processing'])
    .limit(10)
    .get();
  
  console.log();
  
  campaignsSnapshot.forEach(doc => {
    const campaign = doc.data();
    console.log(JSON.stringify({
      id: doc.id,
      name: campaign.name,
      subject: campaign.subject,
      status: campaign.status,
      scheduledFor: campaign.scheduledFor?.toDate(),
      createdAt: campaign.createdAt
    }, null, 2));
  });
}

checkScheduledEmails().catch(console.error);
