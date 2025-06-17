const express = require("express");
const router = express.Router();
const badgeController = require('../controllers/badge.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');


/**
 * @swagger
 * tags:
 *   name: Badges
 *   description: Quản lý huy hiệu trong hệ thống
 */

/**
 * @swagger
 * /api/badges:
 *   get:
 *     summary: Lấy tất cả huy hiệu
 *     tags: [Badges]
 *     responses:
 *       200:
 *         description: Trả về danh sách huy hiệu
 */
router.get("/", badgeController.getAllBadges);

/**
 * @swagger
 * /api/badges/user:
 *   get:
 *     summary: Get badges achieved by the authenticated user
 *     description: |
 *       Returns a list of badges the user has achieved, including badge details and the date it was granted.
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of achieved badges
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 badges:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                       description:
 *                         type: string
 *                       proOnly:
 *                         type: boolean
 *                       condition:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           value:
 *                             type: number
 *                           unit:
 *                             type: string
 *                           description:
 *                             type: string
 *                       granted_date:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/user', authenticateToken, badgeController.getUserBadges);

/**
 * @swagger
 * /api/badges/upcoming:
 *   get:
 *     summary: Get upcoming badges that the authenticated user has not yet achieved
 *     description: Returns a list of badges that the user has not been granted yet.
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of upcoming badges
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 badges:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                       date:
 *                         type: string
 *                         format: date-time
 *                       description:
 *                         type: string
 *                       proOnly:
 *                         type: boolean
 *                       condition:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           value:
 *                             type: number
 *                           unit:
 *                             type: string
 *                           description:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/upcoming', authenticateToken, badgeController.getUpcomingBadges);

/**
 * @swagger
 * /api/badges/summary:
 *   get:
 *     summary: Get badge summary for the authenticated user
 *     description: Returns badge achieved count, upcoming count, and completion rate.
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary of badge progress
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 badge_achieved_count:
 *                   type: integer
 *                 badge_upcoming_count:
 *                   type: integer
 *                 completion_rate:
 *                   type: integer
 *                   description: Percentage of badges achieved
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/summary', authenticateToken, badgeController.getBadgeSummary);

/**
 * @swagger
 * /api/badges/{id}:
 *   get:
 *     summary: Lấy huy hiệu theo ID
 *     tags: [Badges]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của huy hiệu
 *     responses:
 *       200:
 *         description: Trả về huy hiệu tương ứng
 *       404:
 *         description: Không tìm thấy huy hiệu
 */
router.get("/:id", badgeController.getBadgeById);


/**
 * @swagger
 * /api/badges:
 *   post:
 *     summary: Tạo huy hiệu mới
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - condition
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *               proOnly:
 *                 type: boolean
 *               condition:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [no_smoke_days, money_saved]
 *                   value:
 *                     type: number
 *                   unit:
 *                     type: string
 *                     enum: [days, vnd]
 *                   description:
 *                     type: string
 *     responses:
 *       201:
 *         description: Huy hiệu đã được tạo thành công
 *       400:
 *         description: Lỗi dữ liệu đầu vào
 */
router.post('/', authenticateToken, isAdmin, badgeController.createBadge);

/**
 * @swagger
 * /api/badges/{id}:
 *   put:
 *     summary: Cập nhật huy hiệu theo ID
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của huy hiệu cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *               proOnly:
 *                 type: boolean
 *               condition:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [no_smoke_days, money_saved]
 *                   value:
 *                     type: number
 *                   unit:
 *                     type: string
 *                     enum: [days, vnd]
 *                   description:
 *                     type: string
 *     responses:
 *       200:
 *         description: Huy hiệu đã được cập nhật
 *       404:
 *         description: Không tìm thấy huy hiệu
 */
router.put('/:id', authenticateToken, isAdmin, badgeController.updateBadge);

/**
 * @swagger
 * /api/badges/{id}:
 *   delete:
 *     summary: Xoá huy hiệu theo ID
 *     tags: [Badges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của huy hiệu cần xoá
 *     responses:
 *       200:
 *         description: Đã xoá huy hiệu thành công
 *       404:
 *         description: Không tìm thấy huy hiệu
 */
router.delete('/:id', authenticateToken, badgeController.deleteBadge);



module.exports = router;
