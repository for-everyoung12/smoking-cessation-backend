const express = require("express");
const router = express.Router();
const controller = require("../controllers/notification.controller");
const authenticateToken = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Notification
 *   description: Quản lý thông báo người dùng
 */

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     tags: [Notification]
 *     summary: Lấy danh sách thông báo
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách thông báo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 */
router.get("/", authenticateToken, controller.getMyNotifications);

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   post:
 *     tags: [Notification]
 *     summary: Đánh dấu tất cả là đã đọc (tùy chọn nếu có trường read)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tất cả thông báo đã được đánh dấu là đọc
 */
router.post("/mark-all-read", authenticateToken, controller.markAllAsRead);
/**
 * @swagger
 * /api/notifications/clear-all:
 *   delete:
 *     tags: [Notification]
 *     summary: Xoá tất cả thông báo của người dùng hiện tại
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tất cả thông báo đã được xoá
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Đã xoá tất cả thông báo.
 *       401:
 *         description: Không xác thực
 *       500:
 *         description: Lỗi server
 */
router.delete("/clear-all", authenticateToken, controller.clearAllNotifications);


/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     tags: [Notification]
 *     summary: Đánh dấu một thông báo là đã đọc
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
 *         description: Đã đánh dấu là đã đọc
 *       404:
 *         description: Notification không tìm thấy
 *       500:
 *         description: Lỗi server
 */
router.patch("/:id/read", authenticateToken, controller.markAsRead);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     tags: [Notification]
 *     summary: Xoá thông báo theo ID
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
 *         description: Notification deleted
 *       404:
 *         description: Notification không tìm thấy
 *       500:
 *         description: Lỗi server
 */
router.delete("/:id", authenticateToken, controller.deleteNotification);

module.exports = router;
