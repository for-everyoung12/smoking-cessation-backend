const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityMessage.controller');

/**
 * @swagger
 * /api/community/messages:
 *   get:
 *     summary: Get all community messages
 *     tags:
 *       - Community
 *     responses:
 *       200:
 *         description: List of community messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   author_id:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       full_name:
 *                         type: string
 *                   content:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   parent_post_id:
 *                     type: string
 *                     nullable: true
 *                   type:
 *                     type: string
 *                     enum: [message, reply]
 *       500:
 *         description: Server error
 */
router.get('/messages', communityController.getCommunityMessages);

module.exports = router;
