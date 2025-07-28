const express = require("express");
const router = express.Router();
const commentController = require("../controllers/comment.controller");
const authenticateToken = require("../middlewares/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: APIs cho bình luận blog
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - content
 *         - user_id
 *         - blog_id
 *       properties:
 *         _id:
 *           type: string
 *           description: ID tự động của comment
 *         content:
 *           type: string
 *           description: Nội dung bình luận
 *           example: "Bài viết rất hay và hữu ích!"
 *         user_id:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             full_name:
 *               type: string
 *               example: "Nguyễn Văn A"
 *             profilePicture:
 *               type: string
 *         blog_id:
 *           type: string
 *           description: ID của blog
 *         parent_id:
 *           type: string
 *           description: ID của comment cha (nếu là reply)
 *         replies:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comment'
 *           description: Danh sách replies
 *         likeCount:
 *           type: integer
 *           default: 0
 *           description: Số lượt like
 *         isLiked:
 *           type: boolean
 *           description: User hiện tại đã like chưa
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian tạo
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian cập nhật cuối
 *     CommentInput:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           description: Nội dung bình luận
 *           example: "Bài viết rất hay và hữu ích!"
 *         blog_id:
 *           type: string
 *           description: ID của blog (cho route /comments)
 *           example: "507f1f77bcf86cd799439011"
 *         parent_id:
 *           type: string
 *           description: ID của comment cha (cho reply)
 *           example: "507f1f77bcf86cd799439012"
 *     CommentListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         comments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comment'
 *         total:
 *           type: integer
 *           example: 15
 *         page:
 *           type: integer
 *           example: 1
 *         pages:
 *           type: integer
 *           example: 2
 */

/**
 * @swagger
 * /api/comments:
 *   post:
 *     summary: Tạo bình luận mới (blog_id trong body)
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - blog_id
 *             properties:
 *               content:
 *                 type: string
 *                 description: Nội dung bình luận
 *                 example: "Bài viết rất hay và hữu ích!"
 *               blog_id:
 *                 type: string
 *                 description: ID của blog
 *                 example: "507f1f77bcf86cd799439011"
 *               parent_id:
 *                 type: string
 *                 description: ID của comment cha (cho reply)
 *                 example: "507f1f77bcf86cd799439012"
 *     responses:
 *       201:
 *         description: Bình luận đã được tạo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 comment:
 *                   $ref: '#/components/schemas/Comment'
 *                 message:
 *                   type: string
 *                   example: "Tạo bình luận thành công"
 *       400:
 *         description: Thiếu nội dung hoặc dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Nội dung bình luận là bắt buộc"
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy blog hoặc comment cha
 *       500:
 *         description: Lỗi server
 */
router.post("/comments", authenticateToken, commentController.createComment);

/**
 * @swagger
 * /api/comments/{blogId}:
 *   get:
 *     summary: Lấy danh sách bình luận của blog
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của blog
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng bình luận mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách bình luận
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommentListResponse'
 *       404:
 *         description: Không tìm thấy blog
 *       500:
 *         description: Lỗi server
 */
router.get("/comments/:blogId", commentController.getCommentsByBlog);

/**
 * @swagger
 * /api/blogs/{id}/comments:
 *   post:
 *     summary: Thêm bình luận vào blog (blog_id trong URL)
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
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Nội dung bình luận
 *                 example: "Bài viết rất hay và hữu ích!"
 *               parent_id:
 *                 type: string
 *                 description: ID của comment cha (cho reply)
 *                 example: "507f1f77bcf86cd799439012"
 *     responses:
 *       201:
 *         description: Bình luận đã được tạo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 comment:
 *                   $ref: '#/components/schemas/Comment'
 *                 message:
 *                   type: string
 *                   example: "Tạo bình luận thành công"
 *       400:
 *         description: Thiếu nội dung
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy blog
 *       500:
 *         description: Lỗi server
 */
router.post(
  "/blogs/:id/comments",
  authenticateToken,
  commentController.createComment
);

/**
 * @swagger
 * /api/blogs/{id}/comments:
 *   get:
 *     summary: Lấy danh sách bình luận của blog (blog_id trong URL)
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của blog
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Trang hiện tại
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng bình luận mỗi trang
 *     responses:
 *       200:
 *         description: Danh sách bình luận
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommentListResponse'
 *       404:
 *         description: Không tìm thấy blog
 *       500:
 *         description: Lỗi server
 */
router.get("/blogs/:id/comments", commentController.getCommentsByBlog);

/**
 * @swagger
 * /api/comments/{id}/reply:
 *   post:
 *     summary: Trả lời một bình luận
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bình luận cha
 *         example: "507f1f77bcf86cd799439012"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Nội dung reply
 *                 example: "Cảm ơn bạn nhé!"
 *     responses:
 *       201:
 *         description: Trả lời đã được tạo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 comment:
 *                   $ref: '#/components/schemas/Comment'
 *                 message:
 *                   type: string
 *                   example: "Tạo reply thành công"
 *       400:
 *         description: Thiếu nội dung
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy bình luận cha
 *       500:
 *         description: Lỗi server
 */
router.post(
  "/comments/:id/reply",
  authenticateToken,
  commentController.replyToComment
);

/**
 * @swagger
 * /api/comments/{id}/like:
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
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Đã like
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Đã like bình luận"
 *       400:
 *         description: Đã like trước đó
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy bình luận
 *       500:
 *         description: Lỗi server
 */
router.post(
  "/comments/:id/like",
  authenticateToken,
  commentController.likeComment
);

/**
 * @swagger
 * /api/comments/{id}/unlike:
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
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Đã unlike
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Đã unlike bình luận"
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy bình luận
 *       500:
 *         description: Lỗi server
 */
router.post(
  "/comments/:id/unlike",
  authenticateToken,
  commentController.unlikeComment
);

/**
 * @swagger
 * /api/comments/{id}:
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
 *         example: "507f1f77bcf86cd799439012"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Nội dung mới
 *                 example: "Nội dung mới cập nhật"
 *     responses:
 *       200:
 *         description: Bình luận đã được cập nhật
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 comment:
 *                   $ref: '#/components/schemas/Comment'
 *                 message:
 *                   type: string
 *                   example: "Cập nhật bình luận thành công"
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền cập nhật
 *       404:
 *         description: Không tìm thấy bình luận
 *       500:
 *         description: Lỗi server
 */
router.put("/comments/:id", authenticateToken, commentController.updateComment);

/**
 * @swagger
 * /api/comments/{id}:
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
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Bình luận đã bị xoá
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Xóa bình luận thành công"
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền xóa
 *       404:
 *         description: Không tìm thấy bình luận
 *       500:
 *         description: Lỗi server
 */
router.delete(
  "/comments/:id",
  authenticateToken,
  commentController.deleteComment
);

module.exports = router;
