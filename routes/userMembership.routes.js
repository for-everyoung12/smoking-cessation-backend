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

module.exports = router;
