const express = require("express");
const router = express.Router();
const tagController = require("../controllers/tag.controller");
const authenticateToken = require("../middlewares/auth.middleware");
const { isAdmin } = require("../middlewares/role.middleware");

/**
 * @swagger
 * tags:
 *   name: Tags
 *   description: APIs quản lý tags blog
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Tag:
 *       type: object
 *       required:
 *         - name
 *         - slug
 *       properties:
 *         _id:
 *           type: string
 *           description: ID tự động của tag
 *         name:
 *           type: string
 *           description: Tên tag
 *           example: "JavaScript"
 *         slug:
 *           type: string
 *           description: Slug URL-friendly
 *           example: "javascript"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian tạo
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Thời gian cập nhật cuối
 *     TagInput:
 *       type: object
 *       required:
 *         - name
 *         - slug
 *       properties:
 *         name:
 *           type: string
 *           description: Tên tag
 *           example: "JavaScript"
 *         slug:
 *           type: string
 *           description: Slug URL-friendly
 *           example: "javascript"
 */

/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: Lấy tất cả tags
 *     tags: [Tags]
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
 *         description: Số lượng tags mỗi trang
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tên tag
 *     responses:
 *       200:
 *         description: Danh sách tags thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 tags:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tag'
 *                 total:
 *                   type: integer
 *                   example: 10
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 pages:
 *                   type: integer
 *                   example: 1
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
router.get("/", tagController.getTags);

/**
 * @swagger
 * /api/tags/{id}:
 *   get:
 *     summary: Lấy tag theo ID
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của tag
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Lấy tag thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 tag:
 *                   $ref: '#/components/schemas/Tag'
 *       404:
 *         description: Không tìm thấy tag
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
 *                   example: "Không tìm thấy tag"
 *       500:
 *         description: Lỗi server
 */
router.get("/:id", tagController.getTagById);

/**
 * @swagger
 * /api/tags:
 *   post:
 *     summary: Tạo tag mới (Admin only)
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TagInput'
 *           example:
 *             name: "React"
 *             slug: "react"
 *     responses:
 *       201:
 *         description: Tạo tag thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 tag:
 *                   $ref: '#/components/schemas/Tag'
 *                 message:
 *                   type: string
 *                   example: "Tạo tag thành công"
 *       400:
 *         description: Dữ liệu không hợp lệ
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
 *                   example: "Tên tag đã tồn tại"
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       500:
 *         description: Lỗi server
 */
router.post("/", authenticateToken, isAdmin, tagController.createTag);

/**
 * @swagger
 * /api/tags/{id}:
 *   put:
 *     summary: Cập nhật tag (Admin only)
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của tag
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên tag mới
 *                 example: "React.js"
 *               slug:
 *                 type: string
 *                 description: Slug mới
 *                 example: "react-js"
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
 *                 tag:
 *                   $ref: '#/components/schemas/Tag'
 *                 message:
 *                   type: string
 *                   example: "Cập nhật tag thành công"
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy tag
 *       500:
 *         description: Lỗi server
 */
router.put("/:id", authenticateToken, isAdmin, tagController.updateTag);

/**
 * @swagger
 * /api/tags/{id}:
 *   delete:
 *     summary: Xóa tag (Admin only)
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của tag
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Xóa thành công
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
 *                   example: "Xóa tag thành công"
 *       401:
 *         description: Chưa đăng nhập
 *       403:
 *         description: Không có quyền admin
 *       404:
 *         description: Không tìm thấy tag
 *       409:
 *         description: Không thể xóa vì có blog đang sử dụng
 *       500:
 *         description: Lỗi server
 */
router.delete("/:id", authenticateToken, isAdmin, tagController.deleteTag);

module.exports = router;
