const express = require('express');
const quitPlanRoutes = express.Router();
const quitPlanController = require('../controllers/quitPlan.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const { checkMembershipPermission } = require('../middlewares/membership.middleware');
const { verifyPlanOwnership } = require('../middlewares/planOwnership.middleware');
/**
 * @swagger
 * tags:
 *   name: QuitPlans
 *   description: Manage quit smoking plans
 */


/**
 * @swagger
 * /api/quit-plans:
 *   post:
 *     tags: [QuitPlans]
 *     summary: Create a new quit plan
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               goal:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date
 *               note:
 *                 type: string
 *               coach_user_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Quit plan created
 */
quitPlanRoutes.post(
  '/',
  authenticateToken,
  checkMembershipPermission('can_use_quitplan'),
  quitPlanController.createQuitPlan
);

/**
 * @swagger
 * /api/quit-plans/user/{id}:
 *   get:
 *     tags: [QuitPlans]
 *     summary: Get quit plans of a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of quit plans
 */
quitPlanRoutes.get(
  '/user/:id',
  authenticateToken,
  verifyPlanOwnership,
  quitPlanController.getUserQuitPlans
);

/**
 * @swagger
 * /api/quit-plans/{planId}:
 *   get:
 *     tags: [QuitPlans]
 *     summary: Get details of a quit plan
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
 *         description: Quit plan details
 */
quitPlanRoutes.get(
  '/:planId',
  authenticateToken,
  verifyPlanOwnership,
  quitPlanController.getQuitPlanById
);

/**
 * @swagger
 * /api/quit-plans/{planId}/status:
 *   patch:
 *     tags: [QuitPlans]
 *     summary: Update quit plan status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ongoing, completed, cancelled]
 *     responses:
 *       200:
 *         description: Plan status updated
 */
quitPlanRoutes.patch(
  '/:planId/status',
  authenticateToken,
  verifyPlanOwnership,
  quitPlanController.updateQuitPlanStatus
);

module.exports = quitPlanRoutes;
