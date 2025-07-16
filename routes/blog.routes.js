const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blog.controller");
const authenticateToken = require("../middlewares/auth.middleware");
const authOrGuest = require("../middlewares/authOrGuest");
/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: APIs quản lý blog chia sẻ
 */

/**
 * @swagger
 * /api/blogs:
 *   post:
 *     summary: Tạo blog mới
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               shared_badges:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Blog created
 *       400:
 *         description: Thiếu dữ liệu
 *       500:
 *         description: Lỗi server
 */
router.post("/", authenticateToken, blogController.createBlog);

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Lấy danh sách blog
 *     tags: [Blogs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số blog mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách blog
 *       500:
 *         description: Lỗi server
 */
router.get("/", authOrGuest, blogController.getBlogs);

/**
 * @swagger
 * /api/blogs/{id}:
 *   get:
 *     summary: Lấy chi tiết blog
 *     tags: [Blogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết blog
 *       404:
 *         description: Không tìm thấy
 *       500:
 *         description: Lỗi server
 */
router.get("/:id",authOrGuest, blogController.getBlogById);

/**
 * @swagger
 * /api/blogs/{id}:
 *   put:
 *     summary: Cập nhật blog
 *     tags: [Blogs]
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
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       403:
 *         description: Không có quyền
 *       404:
 *         description: Không tìm thấy
 */
router.put("/:id", authenticateToken, blogController.updateBlog);

/**
 * @swagger
 * /api/blogs/{id}:
 *   delete:
 *     summary: Xoá blog
 *     tags: [Blogs]
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
 *         description: Đã xoá
 *       403:
 *         description: Không có quyền
 *       404:
 *         description: Không tìm thấy
 */
router.delete("/:id", authenticateToken, blogController.deleteBlog);

/**
 * @swagger
 * /api/blogs/{id}/like:
 *   post:
 *     summary: Like blog
 *     tags: [Blogs]
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
 *         description: Đã like
 *       400:
 *         description: Đã like trước đó
 *       404:
 *         description: Không tìm thấy blog
 */
router.post("/:id/like", authenticateToken, blogController.likeBlog);

/**
 * @swagger
 * /api/blogs/{id}/unlike:
 *   post:
 *     summary: Unlike blog
 *     tags: [Blogs]
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
 *         description: Đã unlike
 *       404:
 *         description: Không tìm thấy blog
 */
router.post("/:id/unlike", authenticateToken, blogController.unlikeBlog);

/**
 * @swagger
 * /api/blogs/{id}/share-badges:
 *   post:
 *     summary: Chia sẻ huy hiệu
 *     tags: [Blogs]
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
 *             type: object
 *             properties:
 *               shared_badges:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       403:
 *         description: Không có quyền
 *       404:
 *         description: Không tìm thấy blog
 */
router.post("/:id/share-badges", authenticateToken, blogController.shareBadges);

module.exports = router;
