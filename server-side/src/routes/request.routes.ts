import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorizeRole } from '../middleware/role.middleware';
import {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus,
  cancelRequest,
} from '../controllers/request.controllers';

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Requests
 *   description: Document request management system
 */

/**
 * @openapi
 * /api/requests:
 *   get:
 *     summary: View all requests (Admin Only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all requests with student details
 *
 *   post:
 *     summary: Submit a new document request (Student)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               documentType:
 *                 type: string
 *               reason:
 *                 type: string
 *               quantity:
 *                 type: number
 *               supabaseFileUrl:
 *                 type: string
 */
router.get(
  '/',
  authenticateToken,
  authorizeRole(['admin']),
  getAllRequests
);

router.post(
  '/',
  authenticateToken,
  authorizeRole(['student']),
  createRequest
);

/**
 * @openapi
 * /api/requests/my-requests:
 *   get:
 *     summary: View own requests (Student/Admin)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of requests owned by the authenticated user
 */
router.get(
  '/my-requests',
  authenticateToken,
  authorizeRole(['student', 'admin']),
  getMyRequests
);

/**
 * @openapi
 * /api/requests/{id}:
 *   patch:
 *     summary: Update request status or add remarks (Admin)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum:
 *                   - Pending
 *                   - In Progress
 *                   - Completed
 *                   - Rejected
 *               adminRemarks:
 *                 type: string
 *
 *   delete:
 *     summary: Cancel a pending request (Student)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
router.patch(
  '/:id',
  authenticateToken,
  authorizeRole(['admin']),
  updateRequestStatus
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRole(['student']),
  cancelRequest
);

export default router;