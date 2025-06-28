const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/adminDashboard.controller');
const authenticateToken = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: AdminDashboard
 *   description: Dashboard for admin overview
 */

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     tags: [AdminDashboard]
 *     summary: Get admin dashboard statistics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                       value:
 *                         type: number
 *                       change:
 *                         type: string
 *                       trend:
 *                         type: string
 *                         enum: [up, down]
 *                 recentActivities:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       message:
 *                         type: string
 *                       time:
 *                         type: string
 *                         format: date-time
 *                       status:
 *                         type: string
 *                       user:
 *                         type: string
 */
router.get(
  '/dashboard',
  authenticateToken,
  adminDashboardController.getAdminDashboardStats
);

module.exports = router;
