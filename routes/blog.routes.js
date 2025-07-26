const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blog.controller");
const authenticateToken = require("../middlewares/auth.middleware");
const authOrGuest = require("../middlewares/authOrGuest");
const {
  uploadImages,
  handleUploadError,
} = require("../middlewares/upload.middleware");

/**
 * @swagger
 * tags:
 *   name: Blogs
 *   description: APIs quản lý blog chia sẻ
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BlogImage:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           description: URL của hình ảnh
 *           example: "https://res.cloudinary.com/example/image/upload/v1234567890/blog-images/image.jpg"
 *         public_id:
 *           type: string
 *           description: Public ID của Cloudinary
 *           example: "blog-images/image"
 *         caption:
 *           type: string
 *           description: Chú thích hình ảnh
 *           example: "Hình ảnh minh họa"
 *     Blog:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - author_id
 *       properties:
 *         _id:
 *           type: string
 *           description: ID tự động của blog
 *         title:
 *           type: string
 *           description: Tiêu đề blog
 *           example: "Hướng dẫn bỏ thuốc lá hiệu quả"
 *         description:
 *           type: string
 *           description: Mô tả ngắn
 *           example: "Những phương pháp khoa học giúp bỏ thuốc lá thành công"
 *         content:
 *           type: string
 *           description: Nội dung blog
 *           example: "Nội dung chi tiết về cách bỏ thuốc lá..."
 *         author_id:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             full_name:
 *               type: string
 *               example: "Nguyễn Văn A"
 *             profilePicture:
 *               type: string
 *         status:
 *           type: string
 *           enum: [draft, published]
 *           default: published
 *           description: Trạng thái blog
 *         category:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *               example: "Sức khỏe"
 *             slug:
 *               type: string
 *               example: "suc-khoe"
 *         tags:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               name:
 *                 type: string
 *                 example: "Bỏ thuốc"
 *               slug:
 *                 type: string
 *                 example: "bo-thuoc"
 *         images:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BlogImage'
 *         isFeatured:
 *           type: boolean
 *           default: false
 *           description: Blog nổi bật
 *         viewCount:
 *           type: integer
 *           default: 0
 *           description: Số lượt xem
 *         likeCount:
 *           type: integer
 *           default: 0
 *           description: Số lượt like
 *         commentCount:
 *           type: integer
 *           default: 0
 *           description: Số bình luận
 *         isLiked:
 *           type: boolean
 *           description: User hiện tại đã like chưa
 *         shared_badges:
 *           type: array
 *           items:
 *             type: string
 *           description: Danh sách badge được chia sẻ
 *         published_at:
 *           type: string
 *           format: date-time
 *           description: Thời gian xuất bản
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian tạo
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian cập nhật cuối
 *     BlogInput:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         title:
 *           type: string
 *           description: Tiêu đề blog
 *           example: "Hướng dẫn bỏ thuốc lá hiệu quả"
 *         description:
 *           type: string
 *           description: Mô tả ngắn
 *           example: "Những phương pháp khoa học giúp bỏ thuốc lá thành công"
 *         content:
 *           type: string
 *           description: Nội dung blog
 *           example: "Nội dung chi tiết về cách bỏ thuốc lá..."
 *         status:
 *           type: string
 *           enum: [draft, published]
 *           default: published
 *         category:
 *           type: string
 *           description: ID của category
 *           example: "507f1f77bcf86cd799439011"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: Danh sách ID của tags
 *           example: ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
 *         isFeatured:
 *           type: boolean
 *           default: false
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: binary
 *           description: Hình ảnh blog
 *     BlogListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         blogs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Blog'
 *         total:
 *           type: integer
 *           example: 25
 *         page:
 *           type: integer
 *           example: 1
 *         pages:
 *           type: integer
 *           example: 3
 *         limit:
 *           type: integer
 *           example: 10
 */

/**
 * @swagger
 * /api/blogs:
 *   post:
 *     summary: Tạo blog mới với hình ảnh
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *                 description: Tiêu đề blog
 *                 example: "Hướng dẫn bỏ thuốc lá hiệu quả"
 *               description:
 *                 type: string
 *                 description: Mô tả ngắn
 *                 example: "Những phương pháp khoa học giúp bỏ thuốc lá thành công"
 *               content:
 *                 type: string
 *                 description: Nội dung blog
 *                 example: "Nội dung chi tiết về cách bỏ thuốc lá..."
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 default: published
 *               category:
 *                 type: string
 *                 description: ID của category
 *                 example: "507f1f77bcf86cd799439011"
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Danh sách ID của tags
 *               isFeatured:
 *                 type: boolean
 *                 default: false
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Hình ảnh blog (tối đa 10 ảnh)
 *     responses:
 *       201:
 *         description: Blog created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 blog:
 *                   $ref: '#/components/schemas/Blog'
 *                 message:
 *                   type: string
 *                   example: "Tạo blog thành công"
 *       400:
 *         description: Thiếu dữ liệu hoặc lỗi upload
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
 *                   example: "Title và content là bắt buộc"
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi server
 */
router.post(
  "/",
  authenticateToken,
  uploadImages,
  handleUploadError,
  blogController.createBlog
);

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Lấy danh sách blog với filter nâng cao
 *     tags: [Blogs]
 *     parameters:
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
 *         description: Số blog mỗi trang
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: ID của tác giả
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published]
 *         description: Trạng thái blog
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tiêu đề, nội dung, mô tả
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: ID danh mục
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: ID tag
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *         description: Lọc bài nổi bật
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, oldest, featured, popular]
 *         description: Sắp xếp (mới nhất, cũ nhất, nổi bật, nhiều view)
 *     responses:
 *       200:
 *         description: Danh sách blog
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlogListResponse'
 *       500:
 *         description: Lỗi server
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
 *                   example: "Lỗi server"
 */
router.get("/", authOrGuest, blogController.getBlogs);

/**
 * @swagger
 * /api/blogs/my:
 *   get:
 *     summary: Lấy danh sách blog của user hiện tại
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Số blog mỗi trang
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published]
 *         description: Trạng thái blog
 *     responses:
 *       200:
 *         description: Danh sách blog của user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BlogListResponse'
 *       401:
 *         description: Chưa đăng nhập
 *       500:
 *         description: Lỗi server
 */
router.get("/my", authenticateToken, blogController.getMyBlogs);

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
 *         description: ID của blog
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Chi tiết blog
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 blog:
 *                   $ref: '#/components/schemas/Blog'
 *       404:
 *         description: Không tìm thấy
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
 *                   example: "Không tìm thấy blog"
 *       500:
 *         description: Lỗi server
 */
router.get("/:id", authOrGuest, blogController.getBlogById);

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
 *         description: ID của blog
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Tiêu đề blog
 *               description:
 *                 type: string
 *                 description: Mô tả ngắn
 *               content:
 *                 type: string
 *                 description: Nội dung blog
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *               category:
 *                 type: string
 *                 description: ID của category
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Danh sách ID của tags
 *               isFeatured:
 *                 type: boolean
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Hình ảnh mới
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 blog:
 *                   $ref: '#/components/schemas/Blog'
 *                 message:
 *                   type: string
 *                   example: "Cập nhật blog thành công"
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền
 *       404:
 *         description: Không tìm thấy
 */
router.put(
  "/:id",
  authenticateToken,
  uploadImages,
  handleUploadError,
  blogController.updateBlog
);

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
 *         description: ID của blog
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Đã xoá
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
 *                   example: "Xóa blog thành công"
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền
 *       404:
 *         description: Không tìm thấy
 */
router.delete("/:id", authenticateToken, blogController.deleteBlog);

/**
 * @swagger
 * /api/blogs/{blogId}/images/{imageIndex}:
 *   delete:
 *     summary: Xóa hình ảnh từ blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: blogId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của blog
 *         example: "507f1f77bcf86cd799439011"
 *       - in: path
 *         name: imageIndex
 *         required: true
 *         schema:
 *           type: integer
 *         description: Index của hình ảnh trong array (bắt đầu từ 0)
 *         example: 0
 *     responses:
 *       200:
 *         description: Xóa hình ảnh thành công
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
 *                   example: "Xóa hình ảnh thành công"
 *       400:
 *         description: Index không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền
 *       404:
 *         description: Không tìm thấy blog
 */
router.delete(
  "/:blogId/images/:imageIndex",
  authenticateToken,
  blogController.deleteImage
);

/**
 * @swagger
 * /api/blogs/{id}/rate:
 *   post:
 *     summary: Rating blog bằng sao (1-5)
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của blog
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Số sao rating (1-5)
 *                 example: 5
 *     responses:
 *       200:
 *         description: Rating thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rating thành công"
 *                 averageRating:
 *                   type: string
 *                   example: "4.5"
 *                 ratingCount:
 *                   type: number
 *                   example: 10
 *                 userRating:
 *                   type: number
 *                   example: 5
 *       400:
 *         description: Rating không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy blog
 */
router.post("/:id/rate", authenticateToken, blogController.rateBlog);

/**
 * @swagger
 * /api/blogs/{id}/rating:
 *   get:
 *     summary: Lấy rating của user cho blog
 *     tags: [Blogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của blog
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Lấy rating thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userRating:
 *                   type: number
 *                   nullable: true
 *                   example: 5
 *                 averageRating:
 *                   type: string
 *                   example: "4.5"
 *                 ratingCount:
 *                   type: number
 *                   example: 10
 *       401:
 *         description: Chưa đăng nhập
 *       404:
 *         description: Không tìm thấy blog
 */
router.get("/:id/rating", authenticateToken, blogController.getUserRating);

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
 *         description: ID của blog
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shared_badges
 *             properties:
 *               shared_badges:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Danh sách ID của badges
 *                 example: ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
 *     responses:
 *       200:
 *         description: Thành công
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
 *                   example: "Chia sẻ huy hiệu thành công"
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền
 *       404:
 *         description: Không tìm thấy blog
 */
router.post("/:id/share-badges", authenticateToken, blogController.shareBadges);

module.exports = router;
