import { Request, Response } from 'express';
import { db } from '../config/db';

// 1. CREATE: Submit Request (Student)
export const createRequest = async (req: any, res: Response) => {
    try {
        const { documentType, reason, quantity, supabaseFileUrl } = req.body;
        const studentUid = req.user.id;

        const newRequest = {
            studentUid,
            documentType,
            reason,
            quantity: Number(quantity) || 1,
            supabaseFileUrl: supabaseFileUrl || '',
            status: 'Pending',
            adminRemarks: '', 
            adminFileUrl: '', 
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const docRef = await db.collection('requests').add(newRequest);
        res.status(201).json({ message: 'Request submitted!', id: docRef.id });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// 2. READ: History ng Student
export const getMyRequests = async (req: any, res: Response) => {
    try {
        const studentUid = req.user.id;
        const snapshot = await db.collection('requests')
            .where('studentUid', '==', studentUid)
            .orderBy('createdAt', 'desc')
            .get();

        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(requests);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// 3. READ: Lahat ng Requests (Admin Dashboard)
export const getAllRequests = async (req: Request, res: Response) => {
    try {
        const snapshot = await db.collection('requests')
            .orderBy('createdAt', 'desc')
            .get();

        if (snapshot.empty) return res.status(200).json([]);

        const requests = await Promise.all(snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const userDoc = await db.collection('users').doc(data.studentUid).get();
            const userData = userDoc.exists ? userDoc.data() : null;

            return {
                id: doc.id,
                ...data,
                fullName: userData ? userData.fullName : 'Unknown Student'
            };
        }));

        res.status(200).json(requests);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// 4. UPDATE: Admin Update (Dito madalas ang error sa ID casting)
export const updateRequestStatus = async (req: Request, res: Response) => {
    try {
        // FIX: Siguraduhin na string ang ID para mawala ang TS error
        const id = req.params.id as string; 
        const { status, adminRemarks, adminFileUrl } = req.body;

        if (!id) return res.status(400).json({ message: "Request ID is required" });

        const updateData: any = { updatedAt: new Date() };
        if (status) updateData.status = status;
        if (adminRemarks !== undefined) updateData.adminRemarks = adminRemarks;
        if (adminFileUrl !== undefined) updateData.adminFileUrl = adminFileUrl;

        await db.collection('requests').doc(id).update(updateData);
        res.json({ message: `Request updated successfully`, status });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// 5. UPDATE: Student Edit (Habang Pending pa)
export const updateStudentRequest = async (req: any, res: Response) => {
    try {
        const id = req.params.id as string;
        const studentUid = req.user.id;
        const { reason, quantity } = req.body;

        const docRef = db.collection('requests').doc(id);
        const doc = await docRef.get();

        if (!doc.exists || doc.data()?.studentUid !== studentUid) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (doc.data()?.status !== 'Pending') {
            return res.status(400).json({ message: "Only pending requests can be edited" });
        }

        await docRef.update({ reason, quantity, updatedAt: new Date() });
        res.json({ message: "Request details updated" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// 6. DELETE: Student Cancel
export const cancelRequest = async (req: any, res: Response) => {
    try {
        const id = req.params.id as string; 
        const studentUid = req.user.id;

        const docRef = db.collection('requests').doc(id);
        const doc = await docRef.get();

        if (!doc.exists || doc.data()?.studentUid !== studentUid) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Tanging "Pending" lang ang pwedeng i-cancel ng student
        if (doc.data()?.status !== 'Pending') {
            return res.status(400).json({ message: "Only pending requests can be cancelled" });
        }

        await docRef.delete();
        res.json({ message: "Request cancelled successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// 7. DELETE: Admin Purge (Permanent Delete)
export const adminDeleteRequest = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        if (!id) return res.status(400).json({ message: "Request ID is required" });

        await db.collection('requests').doc(id).delete();
        res.json({ message: "Record permanently deleted by admin" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};