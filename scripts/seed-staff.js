const admin = require('firebase-admin');

// Ensure you have set GOOGLE_APPLICATION_CREDENTIALS or initialized admin with certs in this script
// This is a simple script meant to be run locally: `node scripts/seed-staff.js`

const serviceAccount = require('../serviceAccountKey.json'); // You would need to download this from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function createStaffUser() {
  try {
    const userRecord = await admin.auth().createUser({
      email: 'staff@matchday.ai',
      emailVerified: true,
      password: 'password123',
      displayName: 'Staff Member',
    });
    console.log('Successfully created new staff user:', userRecord.uid);
    process.exit(0);
  } catch (error) {
    console.error('Error creating new user:', error);
    process.exit(1);
  }
}

createStaffUser();
