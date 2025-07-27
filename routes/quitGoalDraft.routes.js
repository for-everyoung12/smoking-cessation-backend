const express = require('express');
const router = express.Router();
const { upsertGoalDraft, getGoalDraft, deleteGoalDraft } = require('../controllers/quitGoalDraft.controller');
const authenticateToken = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: QuitGoalDraft
 *   description: API for managing draft quit goals
 */

/**
 * @swagger
 * /api/quit-goal-draft:
 *   post:
 *     summary: Create or update a draft quit goal for the logged-in user
 *     tags: [QuitGoalDraft]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - goal
 *             properties:
 *               goal:
 *                 type: string
 *                 description: The user's quit goal description
 *                 example: "I want to quit smoking to save money and travel."
 *     responses:
 *       201:
 *         description: Goal draft saved successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/', authenticateToken, upsertGoalDraft);

/**
 * @swagger
 * /api/quit-goal-draft:
 *   get:
 *     summary: Get the current user's quit goal draft
 *     tags: [QuitGoalDraft]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Goal draft retrieved successfully
 *       404:
 *         description: No draft found
 *       500:
 *         description: Server error
 */
router.get('/', authenticateToken, getGoalDraft);

/**
 * @swagger
 * /api/quit-goal-draft:
 *   delete:
 *     summary: Delete the current user's quit goal draft
 *     tags: [QuitGoalDraft]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Goal draft deleted successfully
 *       500:
 *         description: Server error
 */
router.delete('/', authenticateToken, deleteGoalDraft);

module.exports = router;
