import { Request, Response } from 'express';
import { db } from '../config/db';

// 1. CREATE: Submit Request (Student)
export const createRequest = async (req: any, res: Response) => {
    try {
        // Idinagdag ang fullName at requestedBy (email) sa destructuring
        const { documentType, reason, quantity, supabaseFileUrl, fullName, requestedBy } = req.body;
        const studentUid = req.user.id;

        const newRequest = {
            studentUid,
            fullName: fullName || 'Anonymous Student', // Para hindi mawala ang student information
            requestedBy: requestedBy || 'N/A',         // Para sa tracking ng email
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
            
            // Kung wala pang fullName sa request document, kukunin sa users collection
            if (!data.fullName) {
                const userDoc = await db.collection('users').doc(data.studentUid).get();
                const userData = userDoc.exists ? userDoc.data() : null;
                return {
                    id: doc.id,
                    ...data,
                    fullName: userData ? userData.fullName : 'Unknown Student'
                };
            }

            return {
                id: doc.id,
                ...data
            };
        }));

        res.status(200).json(requests);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// 4. UPDATE: Admin Update
export const updateRequestStatus = async (req: Request, res: Response) => {
    try {
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

// 5. UPDATE: Student Edit (With Automatic System Remark)
export const updateStudentRequest = async (req: any, res: Response) => {
    try {
        const id = req.params.id as string;
        const studentUid = req.user.id;
        const { reason, quantity } = req.body;
        const timestamp = new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' });

        const docRef = db.collection('requests').doc(id);
        const doc = await docRef.get();

        if (!doc.exists || doc.data()?.studentUid !== studentUid) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        if (doc.data()?.status !== 'Pending') {
            return res.status(400).json({ message: "Only pending requests can be edited" });
        }

        const oldRemarks = doc.data()?.adminRemarks || '';
        const systemNote = `${oldRemarks}\n[SYSTEM: Updated by student on ${timestamp}]`.trim();

        await docRef.update({ 
            reason, 
            quantity, 
            adminRemarks: systemNote,
            updatedAt: new Date() 
        });

        res.json({ message: "Request details updated and admin notified via remarks" });
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

        if (doc.data()?.status !== 'Pending') {
            return res.status(400).json({ message: "Only pending requests can be cancelled" });
        }

        await docRef.delete();
        res.json({ message: "Request cancelled successfully" });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

// 7. DELETE: Admin Purge
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