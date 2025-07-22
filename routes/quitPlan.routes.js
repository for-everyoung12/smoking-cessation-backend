const express = require('express');
const quitPlanRoutes = express.Router();
const quitPlanController = require('../controllers/quitPlan.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const { checkMembershipPermission } = require('../middlewares/membership.middleware');
const { verifyPlanOwnership } = require('../middlewares/planOwnership.middleware');
const logActivity = require('../middlewares/activityLog.middleware');

/**
 * @swagger
 * tags:
 *   name: QuitPlans
 *   description: Manage quit smoking plans
 */


const { isAdmin } = require('../middlewares/role.middleware');

/**
 * @swagger
 * /api/quit-plans:
 *   get:
 *     tags: [QuitPlans]
 *     summary: Get all quit plans (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all quit plans
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/QuitPlans'
 *       500:
 *         description: Failed to fetch plans
 */
quitPlanRoutes.get(
  '/',
  authenticateToken,
  isAdmin,
  quitPlanController.getAllQuitPlans
);

/**
 * @swagger
 * /api/quit-plans:
 *   post:
 *     tags: [QuitPlans]
 *     summary: Create a new quit plan with suggested stages
 *     description: |
 *       Creates a quit plan for the authenticated user.  
 *       If the user has recorded their smoking status beforehand (via `/api/smoking-status/pre-plan`),  
 *       the system will automatically suggest the number and type of stages based on:
 *       - `cigarette_count`
 *       - `suction_frequency`
 *     
 *       Default stage fallback will be applied if no smoking data is found.
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
 *               - start_date
 *             properties:
 *               goal:
 *                 type: string
 *                 example: "Quit smoking in 30 days"
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-07-20"
 *               note:
 *                 type: string
 *               coach_user_id:
 *                 type: string
 *                 description: Optional coach ID (requires `can_assign_coach`)
 *               reasons:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Main reasons user wants to quit
 *               reasons_detail:
 *                 type: string
 *                 description: Additional details about motivationx`
 *     responses:
 *       201:
 *         description: Quit plan created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Quit plan created successfully.
 *                 plan:
 *                   $ref: '#/components/schemas/QuitPlans'
 *                 stages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/QuitStage'
 *       403:
 *         description: User is not permitted to create quit plan
 *       409:
 *         description: User already has an active quit plan
 *       400:
 *         description: Invalid input (e.g., bad start date)
 *       500:
 *         description: Failed to create quit plan
 */
quitPlanRoutes.post(
  '/',
  authenticateToken,
  checkMembershipPermission('can_use_quitplan'),
  logActivity('User created a new quit plan', 'success'),
  quitPlanController.createQuitPlan
);
/**
 * @swagger
 * /api/quit-plans/stage-suggestion:
 *   get:
 *     tags: [QuitPlans]
 *     summary: Get suggested quit plan stages based on user's latest smoking status
 *     description: |
 *       Returns a list of suggested stages (name + description) based on the user's most recent smoking status entry (not yet linked to any plan).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Suggested stages returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 suggested_stages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *       404:
 *         description: No smoking status found
 *       500:
 *         description: Failed to generate stage suggestions
 */
quitPlanRoutes.get(
  '/stage-suggestion',
  authenticateToken,
  quitPlanController.getSuggestedStages
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

/**
 * @swagger
 * /api/quit-plans/{planId}/summary:
 *   get:
 *     tags: [QuitPlans]
 *     summary: Get quit plan progress summary
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the quit plan
 *     responses:
 *       200:
 *         description: Summary of the quit plan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 plan_id:
 *                   type: string
 *                 goal:
 *                   type: string
 *                 start_date:
 *                   type: string
 *                   format: date
 *                 status:
 *                   type: string
 *                 total_stages:
 *                   type: integer
 *                 completed_stages:
 *                   type: integer
 *                 progress_days:
 *                   type: integer
 *                 total_cigarettes:
 *                   type: number
 *                 total_money_spent:
 *                   type: number
 *                 latest_progress_date:
 *                   type: string
 *                   format: date-time
 *                 completion_rate:
 *                   type: integer
 *       404:
 *         description: Plan not found or access denied
 *       500:
 *         description: Failed to generate summary
 */
quitPlanRoutes.get(
  '/:planId/summary',
  authenticateToken,
  verifyPlanOwnership,
  quitPlanController.getQuitPlanSummary
);




module.exports = quitPlanRoutes;
