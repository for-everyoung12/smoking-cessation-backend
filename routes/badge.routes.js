const express = require("express");
const router = express.Router();
<<<<<<< Updated upstream
const badgeController = require('../controllers/badge.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

=======
const badgeController = require("../controllers/badge.controller");
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
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
=======
 *                 type: string
 *               proOnly:
 *                 type: boolean
 *                 default: false
>>>>>>> Stashed changes
 *     responses:
 *       201:
 *         description: Huy hiệu đã được tạo thành công
 *       400:
 *         description: Lỗi dữ liệu đầu vào
 */
<<<<<<< Updated upstream
router.post('/', authenticateToken, isAdmin, badgeController.createBadge);
=======
router.post("/", badgeController.createBadge);
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
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
=======
 *                 type: string
 *               proOnly:
 *                 type: boolean
 *                 default: false
>>>>>>> Stashed changes
 *     responses:
 *       200:
 *         description: Huy hiệu đã được cập nhật
 *       404:
 *         description: Không tìm thấy huy hiệu
 */
<<<<<<< Updated upstream
router.put('/:id', authenticateToken, isAdmin, badgeController.updateBadge);
=======
router.put("/:id", badgeController.updateBadge);
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
router.delete('/:id', authenticateToken, badgeController.deleteBadge);
=======
router.delete("/:id", badgeController.deleteBadge);
>>>>>>> Stashed changes

module.exports = router;
