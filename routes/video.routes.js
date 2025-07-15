const express = require("express");
const authenticateToken = require("../middlewares/auth.middleware");
const { createStreamUser, getStreamToken,getJitsiRoomLink  } = require("../controllers/video.controller");
const { getJitsiJwt } = require("../controllers/video.controller");
const coachUserController = require("../controllers/coachUser.controller");

const router = express.Router();

/**
 * @swagger
 * /api/video/create-user:
 *   post:
 *     summary: Upsert user lên Stream
 *     tags:
 *       - Video
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User created or updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post("/create-user", authenticateToken, createStreamUser);

/**
 * @swagger
 * /api/video/token:
 *   get:
 *     summary: Lấy Stream token cho user
 *     tags:
 *       - Video
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token generated
 *       500:
 *         description: Server error
 */

router.get("/token", authenticateToken, getStreamToken);

/**
 * @swagger
 * /api/video/room/{coachId}/{memberId}:
 *   get:
 *     summary: Lấy link phòng Jitsi cho coach và member
 *     tags:
 *       - Video
 *     parameters:
 *       - in: path
 *         name: coachId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của coach
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của member
 *     responses:
 *       200:
 *         description: Trả về link phòng Jitsi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 roomUrl:
 *                   type: string
 *                   example: https://meet.jit.si/coach1_member2
 */
router.get('/room/:coachId/:memberId', getJitsiRoomLink);

/**
 * @swagger
 * /api/video/jwt:
 *   post:
 *     summary: Lấy JWT cho Jitsi
 *     tags:
 *       - Video
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [room, userId, userName]
 *             properties:
 *               room:
 *                 type: string
 *               userId:
 *                 type: string
 *               userName:
 *                 type: string
 *     responses:
 *       200:
 *         description: JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Thiếu tham số
 *       500:
 *         description: Lỗi server
 */
router.post('/jwt', getJitsiJwt);

/**
 * @swagger
 * /api/video/coach/{userId}:
 *   get:
 *     summary: Lấy coachId của user (alias cho /coach-user/coach-of-user/:userId)
 *     tags:
 *       - Video
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user
 *     responses:
 *       200:
 *         description: Trả về coachId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 coachId:
 *                   type: string
 *       404:
 *         description: Không tìm thấy coach
 *       500:
 *         description: Lỗi server
 */
router.get('/coach/:userId', coachUserController.getCoachByUserId);

module.exports = router;
