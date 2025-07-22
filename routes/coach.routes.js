const express = require('express');
const router = express.Router();
const coachController = require('../controllers/coach.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');
const multer = require("multer");
const { storage } = require("../utils/cloudinary");
const upload = multer({ storage });
/**
 * @swagger
 * tags:
 *   name: Coaches
 *   description: Manage coach accounts (Admin only)
 */

/**
 * @swagger
 * /api/coaches:
 *   post:
 *     tags: [Coaches]
 *     summary: Tạo mới một coach (có thể upload avatar)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - email
 *               - password
 *             properties:
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               specialization:
 *                 type: string
 *               experience:
 *                 type: string
 *               birth_date:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Tạo coach thành công
 *       409:
 *         description: Email đã tồn tại
 *       500:
 *         description: Lỗi server
 */
router.post('/', authenticateToken, isAdmin,upload.single("avatar"), coachController.createCoach);

/**
 * @swagger
 * /api/coaches:
 *   get:
 *     tags: [Coaches]
 *     summary: Get list of coaches
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of coaches
 *       500:
 *         description: Failed to fetch coaches
 */
router.get('/', authenticateToken, coachController.getCoaches);

/**
 * @swagger
 * /api/coaches/{id}:
 *   patch:
 *     tags: [Coaches]
 *     summary: Cập nhật thông tin coach (có thể upload avatar)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của coach cần cập nhật
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *               specialization:
 *                 type: string
 *               experience:
 *                 type: string
 *               birth_date:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Cập nhật coach thành công
 *       404:
 *         description: Không tìm thấy coach
 *       500:
 *         description: Lỗi server
 */
router.patch('/:id', authenticateToken, isAdmin,upload.single("avatar"), coachController.updateCoach);

/**
 * @swagger
 * /api/coaches/{id}:
 *   get:
 *     tags: [Coaches]
 *     summary: Lấy thông tin chi tiết một coach
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID của coach
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin coach
 *       404:
 *         description: Không tìm thấy coach
 *       500:
 *         description: Lỗi server
 */
router.get(
  "/:id",
  authenticateToken,
  coachController.getCoachById
);

/**
 * @swagger
 * /api/coaches/{id}:
 *   delete:
 *     tags: [Coaches]
 *     summary: Xoá một coach
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của coach cần xoá
 *     responses:
 *       200:
 *         description: Xoá thành công
 *       404:
 *         description: Không tìm thấy coach
 *       500:
 *         description: Lỗi server
 */
router.delete('/:id', authenticateToken, isAdmin, coachController.deleteCoach);

module.exports = router;
