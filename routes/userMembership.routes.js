// routes/userMembership.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/userMembership.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

/**
 * @swagger
 * tags:
 *   name: UserMembership
 *   description: Quản lý thông tin gói thành viên của người dùng
 */

/**
 * @swagger
 * /api/user-membership/me:
 *   get:
 *     summary: Lấy membership hiện tại của người dùng
 *     tags: [UserMembership]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Membership hiện tại
 *       404:
 *         description: Không có membership
 */
router.get('/me', authenticateToken, controller.getCurrentMembership);

/**
 * @swagger
 * /api/user-membership/me/history:
 *   get:
 *     summary: Lịch sử membership của tôi
 *     tags: [UserMembership]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách các gói đã đăng ký
 */
router.get('/me/history', authenticateToken, controller.getMyMembershipHistory);

/**
 * @swagger
 * /api/user-membership:
 *   get:
 *     summary: Admin xem toàn bộ gói người dùng đã mua
 *     tags: [UserMembership]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách membership
 */
router.get('/', authenticateToken, isAdmin, controller.getAllMemberships);

/**
 * @swagger
 * /api/user-membership/admin/{id}:
 *   get:
 *     summary: Get current membership of a user by ID (admin only)
 *     tags: [UserMembership]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: Membership info of user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: string
 *                 status:
 *                   type: string
 *                 package_id:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                 payment_date:
 *                   type: string
 *                   format: date
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (not admin)
 *       404:
 *         description: No active membership found
 */
router.get('/admin/:id', authenticateToken, isAdmin, controller.getMembershipByUserId);


module.exports = router;
