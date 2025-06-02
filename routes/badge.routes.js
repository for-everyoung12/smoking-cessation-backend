// routes/badge.routes.js
const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badge.controller');

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
router.get('/', badgeController.getAllBadges);

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
router.get('/:id', badgeController.getBadgeById);

/**
 * @swagger
 * /api/badges:
 *   post:
 *     summary: Tạo huy hiệu mới
 *     tags: [Badges]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
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
 *               condition:
 *                 type: string
 *     responses:
 *       201:
 *         description: Huy hiệu đã được tạo thành công
 *       400:
 *         description: Lỗi dữ liệu đầu vào
 */
router.post('/', badgeController.createBadge);

/**
 * @swagger
 * /api/badges/{id}:
 *   put:
 *     summary: Cập nhật huy hiệu theo ID
 *     tags: [Badges]
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
 *               condition:
 *                 type: string
 *     responses:
 *       200:
 *         description: Huy hiệu đã được cập nhật
 *       404:
 *         description: Không tìm thấy huy hiệu
 */
router.put('/:id', badgeController.updateBadge);

/**
 * @swagger
 * /api/badges/{id}:
 *   delete:
 *     summary: Xoá huy hiệu theo ID
 *     tags: [Badges]
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
router.delete('/:id', badgeController.deleteBadge);

module.exports = router;
