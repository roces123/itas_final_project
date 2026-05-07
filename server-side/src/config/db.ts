import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// DEBUG: Tingnan natin kung may laman ba talaga ang .env
console.log("Project ID Check:", process.env.FIREBASE_PROJECT_ID);

if (!admin.apps.length) {
  try {
    const serviceAccount = {
      project_id: process.env.FIREBASE_PROJECT_ID,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    // I-double check natin kung may 'undefined' dito
    if (!serviceAccount.project_id) {
      console.error("❌ Error: FIREBASE_PROJECT_ID is undefined in .env!");
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as any),
    });
    console.log("✅ Database (Firestore) Connected!");
  } catch (error) {
    console.error("❌ Firebase Initialization Error:", error);
  }
}

export const db = admin.firestore();