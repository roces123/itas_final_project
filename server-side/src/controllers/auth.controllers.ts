import { Request, Response } from 'express';
import { db } from '../config/db';
import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// ======================
// LOGIN
// ======================
export const login = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    // ✅ Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    // ======================
    // ADMIN CHECK
    // ======================
    if (email === 'admin@isufst.edu.ph') {
      const adminToken = jwt.sign(
        { id: uid, email, role: 'admin' },
        process.env.JWT_SECRET as string,
        { expiresIn: '1d' }
      );

      return res.status(200).json({
        message: "Admin Login Success",
        token: adminToken,
        userRole: 'admin',
        userData: {
          uid,
          email,
          fullName: 'Admin',
          role: 'admin'
        }
      });
    }

    // ======================
    // STUDENT FETCH
    // ======================
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        message: "User record not found"
      });
    }

    const userData = userDoc.data();

    // ======================
    // CREATE JWT
    // ======================
    const appToken = jwt.sign(
      {
        id: uid,
        email,
        role: userData?.role || 'student'
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    // ✅ UPDATED: Isinama ang lahat ng profile details para ma-update ang Profile Screen
    return res.status(200).json({
      message: "Login Success",
      token: appToken,
      userRole: userData?.role || 'student',
      userData: {
        uid,
        email,
        fullName: userData?.fullName,
        phoneNumber: userData?.phoneNumber || 'N/A', // Kinuha mula sa Firestore
        studentId: userData?.studentId || 'N/A',     // Kinuha mula sa Firestore
        course: userData?.course || 'N/A',           // Kinuha mula sa Firestore
        role: userData?.role || 'student'
      }
    });

  } catch (error: any) {
    console.error("❌ Login Error:", error);
    return res.status(401).json({
      message: "Invalid Firebase token",
      error: error.message
    });
  }
};

// ======================
// REGISTER
// ======================
export const register = async (req: Request, res: Response) => {
  try {
    const {
      firebaseUid,
      email,
      fullName,
      role,
      phoneNumber, // Tanggapin mula sa frontend
      studentId,   // Tanggapin mula sa frontend
      course       // Tanggapin mula sa frontend
    } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({
        message: "Firebase UID required"
      });
    }

    // ✅ UPDATED: Sinisave na ang lahat ng info sa Firestore document
    await db.collection('users').doc(firebaseUid).set({
      email,
      fullName,
      phoneNumber: phoneNumber || 'N/A', 
      studentId: studentId || 'N/A',     
      course: course || 'N/A',           
      role: role || 'student',
      createdAt: new Date()
    });

    return res.status(201).json({
      message: "User profile saved successfully",
      uid: firebaseUid
    });

  } catch (error: any) {
    console.error("❌ Register Error:", error);
    return res.status(500).json({
      message: "Registration Error",
      error: error.message
    });
  }
};