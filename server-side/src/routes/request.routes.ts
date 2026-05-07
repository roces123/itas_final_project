import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorizeRole } from '../middleware/role.middleware';

import {
  createRequest,
  getMyRequests,
  getAllRequests,
  updateRequestStatus,
  updateStudentRequest,
  cancelRequest,
  adminDeleteRequest,
} from '../controllers/request.controllers';

const router = Router();

/**
 * @openapi
 * tags:
 *   - name: Requests
 *     description: Document request management system for ISUFST
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
 *         description: List of all incoming requests
 *
 *   post:
 *     summary: Submit a new document request (Student Only)
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
 *     responses:
 *       201:
 *         description: Request submitted successfully
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
 *         description: User request history
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
 *     summary: Update request status (Admin Only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request status updated successfully
 *
 *   put:
 *     summary: Edit pending request details (Student Only)
 *     description: This endpoint matches dashboard.ts line 93 to fix the 404 error.
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request updated successfully
 *
 *   delete:
 *     summary: Cancel a pending request (Student Only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request cancelled successfully
 */
router.patch(
  '/:id',
  authenticateToken,
  authorizeRole(['admin']),
  updateRequestStatus
);

// FIXED: Matches http://localhost:3000/api/requests/{id}
router.put(
  '/:id',
  authenticateToken,
  authorizeRole(['student']),
  updateStudentRequest
);

router.delete(
  '/:id',
  authenticateToken,
  authorizeRole(['student']),
  cancelRequest
);

/**
 * @openapi
 * /api/requests/admin/{id}:
 *   delete:
 *     summary: Permanently delete a request (Admin Only)
 *     tags: [Requests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request permanently deleted
 */
router.delete(
  '/admin/:id',
  authenticateToken,
  authorizeRole(['admin']),
  adminDeleteRequest
);

export default router;