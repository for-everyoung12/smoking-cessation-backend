const express = require('express');
const router = express.Router();
const coachController = require('../controllers/coach.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

/**
 * @swagger
 * tags:
 *   name: Coaches
 *   description: Manage coach accounts (Admin only)
 */

/**
 * @swagger
 * /api/coaches:
 *   post:
 *     tags: [Coaches]
 *     summary: Create a new coach
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [full_name, email, password]
 *             properties:
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Coach created
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Failed to create coach
 */
router.post('/', authenticateToken, isAdmin, coachController.createCoach);

/**
 * @swagger
 * /api/coaches:
 *   get:
 *     tags: [Coaches]
 *     summary: Get list of coaches
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of coaches
 *       500:
 *         description: Failed to fetch coaches
 */
router.get('/', authenticateToken, coachController.getCoaches);

/**
 * @swagger
 * /api/coaches/{coachId}:
 *   patch:
 *     tags: [Coaches]
 *     summary: Update a coach
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: coachId
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
 *               full_name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Coach updated
 *       404:
 *         description: Coach not found
 *       500:
 *         description: Failed to update coach
 */
router.patch('/:coachId', authenticateToken, isAdmin, coachController.updateCoach);

/**
 * @swagger
 * /api/coaches/{coachId}:
 *   delete:
 *     tags: [Coaches]
 *     summary: Delete a coach
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: coachId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coach deleted
 *       404:
 *         description: Coach not found
 *       500:
 *         description: Failed to delete coach
 */
router.delete('/:coachId', authenticateToken, isAdmin, coachController.deleteCoach);

module.exports = router;
