import admin from 'firebase-admin';
import * as dotenv from 'dotenv'; // Baguhin ang import ng dotenv

// DAPAT NAUNA ITO sa kahit anong logic
dotenv.config();

// DEBUG: Makikita mo ito sa Render Logs mamaya
console.log("Checking Render Env Variables...");
console.log("Project ID:", process.env.FIREBASE_PROJECT_ID ? "✅ OK" : "❌ MISSING");
console.log("Client Email:", process.env.FIREBASE_CLIENT_EMAIL ? "✅ OK" : "❌ MISSING");
console.log("Private Key length:", process.env.FIREBASE_PRIVATE_KEY?.length || 0);

if (!admin.apps.length) {
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

    if (!serviceAccount.privateKey || !serviceAccount.projectId) {
       throw new Error("Missing Firebase credentials in environment variables.");
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as any),
    });
    console.log("✅ Firebase Admin Initialized!");
  } catch (error) {
    console.error("❌ Firebase Initialization Error:", error);
  }
}

export const db = admin.firestore();