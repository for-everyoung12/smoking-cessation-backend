const express = require('express');
const stageRouter = express.Router();
const quitStageController = require('../controllers/quitState.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const { verifyPlanOwnership } = require('../middlewares/planOwnership.middleware');
/**
 * @swagger
 * /api/quit-plans/{planId}/stages:
 *   get:
 *     tags: [QuitStages]
 *     summary: Get all stages of a quit plan
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of stages
 */
stageRouter.get(
    '/:planId/stages',
    authenticateToken,
    verifyPlanOwnership,
    quitStageController.getStagesByPlan
  );
  
  module.exports = stageRouter;