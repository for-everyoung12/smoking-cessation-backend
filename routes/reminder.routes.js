const express = require('express');
const router = express.Router();
const controller = require('../controllers/reminder.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const { checkMembershipPermission } = require('../middlewares/membership.middleware');

/**
 * @swagger
 * tags:
 *   name: Reminder
 *   description: Quản lý nhắc nhở người dùng
 */

/**
 * @swagger
 * /api/reminders:
 *   post:
 *     tags: [Reminder]
 *     summary: Tạo reminder mới
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Uống nước
 *               content:
 *                 type: string
 *                 example: Nhắc bạn uống 1 cốc nước lúc 9h sáng
 *               remind_at:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-06-29T09:00:00.000Z"
 *               is_recurring:
 *                 type: boolean
 *                 example: false
 *               repeat_pattern:
 *                 type: string
 *                 enum: [daily, weekly]
 *                 example: daily
 *     responses:
 *       201:
 *         description: Reminder created successfully
 *       403:
 *         description: Membership không cho phép tạo reminder
 *       500:
 *         description: Lỗi server
 */
router.post(
  '/',
  authenticateToken,
  checkMembershipPermission('can_use_reminder'),
  controller.createReminder
);

/**
 * @swagger
 * /api/reminders:
 *   get:
 *     tags: [Reminder]
 *     summary: Lấy danh sách reminder của người dùng hiện tại
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách reminder
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reminder'
 *       500:
 *         description: Lỗi server
 */
router.get('/', authenticateToken, controller.getMyReminders);

/**
 * @swagger
 * /api/reminders/{id}:
 *   delete:
 *     tags: [Reminder]
 *     summary: Xoá một reminder theo ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của reminder
 *     responses:
 *       200:
 *         description: Reminder deleted
 *       404:
 *         description: Reminder không tìm thấy
 *       500:
 *         description: Lỗi server
 */
router.delete('/:id', authenticateToken, controller.deleteReminder);

module.exports = router;
