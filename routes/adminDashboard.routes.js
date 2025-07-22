const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/adminDashboard.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

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
  isAdmin,
  adminDashboardController.getAdminDashboardStats
);

/**
 * @swagger
 * /api/admin/reminders/send:
 *   post:
 *     tags: [AdminDashboard]
 *     summary: Admin gửi reminder đến user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["user_id_1", "user_id_2"]
 *               title:
 *                 type: string
 *                 example: Nhắc cập nhật nhật ký
 *               content:
 *                 type: string
 *                 example: Bạn đã cập nhật quá trình bỏ thuốc hôm nay chưa?
 *               remind_at:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-07-01T15:00:00.000Z"
 *               is_recurring:
 *                 type: boolean
 *                 example: false
 *               repeat_pattern:
 *                 type: string
 *                 enum: [daily, weekly, monthly]
 *     responses:
 *       200:
 *         description: Reminder sent to all users
 */
router.post(
  "/reminders/send",
  authenticateToken,
  isAdmin,
  adminDashboardController.sendReminderToUsers
);


/**
 * @swagger
 * /api/admin/coaches:
 *   get:
 *     tags: [AdminDashboard]
 *     summary: Lấy danh sách tất cả coach
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về danh sách coach
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   full_name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   avatar:
 *                     type: string
 *                   current_users:
 *                     type: number
 *                   max_users:
 *                     type: number
 *                   created_at:
 *                     type: string
 *                     format: date-time
 */
router.get(
  "/coaches",
  authenticateToken,
  isAdmin,
  adminDashboardController.getAllCoaches
);

module.exports = router;
