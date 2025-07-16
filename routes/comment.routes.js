const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const authenticateToken = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: APIs cho bình luận blog
 */

/**
 * @swagger
 * /blogs/{id}/comments:
 *   post:
 *     summary: Thêm bình luận vào blog
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của blog
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: Bài viết rất hay!
 *     responses:
 *       201:
 *         description: Bình luận đã được tạo
 *       400:
 *         description: Thiếu nội dung
 */
router.post('/blogs/:id/comments', authenticateToken, commentController.createComment);

/**
 * @swagger
 * /blogs/{id}/comments:
 *   get:
 *     summary: Lấy danh sách bình luận của blog
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của blog
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Số lượng bình luận mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách bình luận
 */
router.get('/blogs/:id/comments', commentController.getCommentsByBlog);

/**
 * @swagger
 * /comments/{id}/like:
 *   post:
 *     summary: Like một bình luận
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bình luận
 *     responses:
 *       200:
 *         description: Đã like
 */
router.post('/comments/:id/like', authenticateToken, commentController.likeComment);

/**
 * @swagger
 * /comments/{id}/unlike:
 *   post:
 *     summary: Unlike một bình luận
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bình luận
 *     responses:
 *       200:
 *         description: Đã unlike
 */
router.post('/comments/:id/unlike', authenticateToken, commentController.unlikeComment);

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Cập nhật bình luận
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bình luận
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 example: Nội dung mới cập nhật
 *     responses:
 *       200:
 *         description: Bình luận đã được cập nhật
 */
router.put('/comments/:id', authenticateToken, commentController.updateComment);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Xoá bình luận
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bình luận
 *     responses:
 *       200:
 *         description: Bình luận đã bị xoá
 */
router.delete('/comments/:id', authenticateToken, commentController.deleteComment);

module.exports = router;
