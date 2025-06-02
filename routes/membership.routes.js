const express = require('express');
const router = express.Router();
const controller = require('../controllers/membership.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

/**
 * @swagger
 * tags:
 *   name: Membership
 *   description: Quản lý gói thành viên
 */

/**
 * @swagger
 * /api/memberships:
 *   post:
 *     summary: Tạo gói membership mới
 *     tags: [Membership]
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
 *               - duration_days
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 enum: [default, pro]
 *               description:
 *                 type: string
 *               duration_days:
 *                 type: integer
 *               price:
 *                 type: number
 *               can_message_coach:
 *                 type: boolean
 *               can_assign_coach:
 *                 type: boolean
 *               can_use_quitplan:
 *                 type: boolean
 *               can_use_reminder:
 *                 type: boolean
 *               can_earn_special_badges:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Gói đã được tạo thành công
 *       500:
 *         description: Lỗi server
 */
router.post('/', authenticateToken, isAdmin, controller.create);

/**
 * @swagger
 * /api/memberships:
 *   get:
 *     summary: Lấy tất cả các gói membership
 *     tags: [Membership]
 *     responses:
 *       200:
 *         description: Danh sách gói thành viên
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /api/memberships/{id}:
 *   get:
 *     summary: Lấy chi tiết một gói membership
 *     tags: [Membership]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID gói membership
 *     responses:
 *       200:
 *         description: Thông tin gói membership
 *       404:
 *         description: Không tìm thấy
 */
router.get('/:id', controller.getById);

/**
 * @swagger
 * /api/memberships/{id}:
 *   put:
 *     summary: Cập nhật gói membership
 *     tags: [Membership]
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
 *             $ref: '#/components/schemas/Membership'
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy
 */
router.put('/:id', authenticateToken, isAdmin, controller.update);

/**
 * @swagger
 * /api/memberships/{id}:
 *   delete:
 *     summary: Xoá gói membership
 *     tags: [Membership]
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
 *         description: Đã xoá gói
 *       404:
 *         description: Không tìm thấy
 */
router.delete('/:id', authenticateToken, isAdmin, controller.remove);

module.exports = router;
