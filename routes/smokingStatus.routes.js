const express = require('express');
const smokingStatusRoutes = express.Router();
const authenticateToken = require('../middlewares/auth.middleware');
const smokingStatusController = require('../controllers/smokingStatus.controller');
const checkDuplicateDailyRecord = require('../middlewares/duplicateDailyRecord.middleware');
const SmokingStatus = require('../models/smokingStatus.model');
/**
 * @swagger
 * /api/quit-plan/{planId}/stages/{stageId}/status:
 *   post:
 *     summary: Record smoking status during a stage
 *     tags: [SmokingStatus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: stageId
 *         required: true
 *         schema:
 *           type: string
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
 *               time_of_smoking:
 *                 type: string
 *                 format: date-time
 *               money_spent:
 *                 type: number
 *               health_note:
 *                 type: string
 *               record_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Smoking status recorded
 */
smokingStatusRoutes.post('/:planId/stages/:stageId/status', authenticateToken, checkDuplicateDailyRecord(SmokingStatus, 'record_date'), smokingStatusController.recordSmokingStatus);

/**
 * @swagger
 * /api/quit-plan/{planId}/stages/{stageId}/status:
 *   get:
 *     summary: Get all smoking status records for a stage
 *     tags: [SmokingStatus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: stageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of smoking statuses
 */
smokingStatusRoutes.get('/:planId/stages/:stageId/status', authenticateToken, smokingStatusController.getSmokingStatusByStage);


/**
 * @swagger
 * /api/smoking-status/pre-plan:
 *   post:
 *     summary: Record initial smoking status before creating a quit plan
 *     tags: [SmokingStatus]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cigarette_count
 *               - price_per_pack
 *               - packs_per_week
 *             properties:
 *               cigarette_count:
 *                 type: number
 *                 example: 10
 *               price_per_pack:
 *                 type: number
 *                 example: 25000
 *               packs_per_week:
 *                 type: number
 *                 example: 3.5
 *               time_of_smoking:
 *                 type: string
 *                 format: date-time
 *               suction_frequency:
 *                 type: string
 *                 enum: [light, medium, heavy]
 *               health_note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Initial smoking status recorded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Initial smoking status recorded
 *                 record:
 *                   $ref: '#/components/schemas/SmokingStatus'
 *       500:
 *         description: Failed to record status
 */
smokingStatusRoutes.post(
    '/pre-plan',
    authenticateToken,
    smokingStatusController.recordInitialSmokingStatus
  );
  
/**
 * @swagger
 * /api/smoking-status/pre-plan/latest:
 *   get:
 *     tags: [SmokingStatus]
 *     summary: Get the latest initial smoking status before quit plan
 *     description: |
 *       Retrieves the most recent smoking status submitted by the user that is not yet attached to any quit plan.  
 *       This is used to suggest a personalized quit plan structure (number of stages).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Latest smoking status retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SmokingStatus'
 *       404:
 *         description: No smoking status found
 *       500:
 *         description: Failed to fetch latest smoking status
 */
  smokingStatusRoutes.get(
    "/pre-plan/latest",
    authenticateToken,
    smokingStatusController.getLatestPrePlanStatus
  );
  
module.exports = smokingStatusRoutes;