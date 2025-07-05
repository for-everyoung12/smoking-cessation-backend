const express = require("express");
const authenticateToken = require("../middlewares/auth.middleware");
const { createStreamUser, getStreamToken } = require("../controllers/video.controller");

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

module.exports = router;
