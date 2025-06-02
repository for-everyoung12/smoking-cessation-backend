const express = require('express');
const progressRouter = express.Router();
const authenticateToken = require('../middlewares/auth.middleware');
const progressTrackingController = require('../controllers/progressTracking.controller');
const { verifyPlanOwnership } = require('../middlewares/planOwnership.middleware');
/**
 * @swagger
 * tags:
 *   name: QuitPlanProgress
 *   description: Track quit plan stages and progress
 */

/**
 * @swagger
 * /api/quit-plans/{planId}/stages/{stageId}/progress:
 *   post:
 *     tags: [QuitPlanProgress]
 *     summary: Record progress for a stage
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *       - in: path
 *         name: stageId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cigarette_count
 *             properties:
 *               cigarette_count:
 *                 type: number
 *               note:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Progress recorded
 */
progressRouter.post(
  '/:planId/stages/:stageId/progress',
  authenticateToken,
  verifyPlanOwnership,
  progressTrackingController.recordProgress
);

/**
 * @swagger
 * /api/quit-plans/{planId}/stages/{stageId}/progress:
 *   get:
 *     tags: [QuitPlanProgress]
 *     summary: Get all progress entries for a stage
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *       - in: path
 *         name: stageId
 *         required: true
 *     responses:
 *       200:
 *         description: List of progress records
 */
progressRouter.get(
  '/:planId/stages/:stageId/progress',
  authenticateToken,
  verifyPlanOwnership,
  progressTrackingController.getProgressByStage
);

module.exports = progressRouter;
