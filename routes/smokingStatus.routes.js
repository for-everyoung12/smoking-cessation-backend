const express = require('express');
const smokingStatusRoutes = express.Router();
const authenticateToken = require('../middlewares/auth.middleware');
const smokingStatusController = require('../controllers/smokingStatus.controller');

/**
 * @swagger
 * /api/quit-plan/{planId}/stages/{stageId}/status:
 *   post:
 *     summary: Record smoking status during a stage
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
smokingStatusRoutes.post('/:planId/stages/:stageId/status', authenticateToken, smokingStatusController.recordSmokingStatus);

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
module.exports = smokingStatusRoutes;