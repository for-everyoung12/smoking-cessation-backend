const express = require('express');
const router = express.Router();
const chatCtrl = require('../controllers/chat.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const { checkMembershipPermission } = require('../middlewares/membership.middleware');

/**
 * @swagger
 * /api/chat/session:
 *   get:
 *     summary: Get or create a chat session with a coach
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Session retrieved
 *       201:
 *         description: Session created
 *       403:
 *         description: Permission denied (membership)
 *       500:
 *         description: Server error
 */
router.get(
  '/session',
  authenticateToken,
  checkMembershipPermission('can_assign_coach'),
  chatCtrl.getOrCreateSession
);

/**
 * @swagger
 * /api/chat/messages/{sessionId}:
 *   get:
 *     summary: Get messages in a chat session
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Messages retrieved
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */
router.get(
  '/messages/:sessionId',
  authenticateToken,
  chatCtrl.getMessages
);

/**
 * @swagger
 * /api/chat/session/{sessionId}/close:
 *   post:
 *     summary: Close a chat session
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Session closed
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */
router.post(
  '/session/:sessionId/close',
  authenticateToken,
  chatCtrl.closeSession
);

module.exports = router;
