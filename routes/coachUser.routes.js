const express = require('express');
const router = express.Router();
const coachUserController = require('../controllers/coachUser.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const { isCoach } = require('../middlewares/role.middleware');

/**
 * @swagger
 * tags:
 *   name: CoachUsers
 *   description: Manage coach-user relations
 */

/**
 * @swagger
 * /api/coach-users:
 *   post:
 *     tags: [CoachUsers]
 *     summary: Create a coach-user relation
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [coach_id, user_id]
 *             properties:
 *               coach_id:
 *                 type: string
 *               user_id:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       201:
 *         description: Relation created
 *       500:
 *         description: Failed to create relation
 */
router.post('/', authenticateToken, isCoach, coachUserController.createCoachUser);

/**
 * @swagger
 * /api/coach-users:
 *   get:
 *     tags: [CoachUsers]
 *     summary: Get coach-user relations
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: coach_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, blocked, pending]
 *     responses:
 *       200:
 *         description: List of relations
 *       500:
 *         description: Failed to fetch relations
 */
router.get('/', authenticateToken, isCoach, coachUserController.getCoachUsers);

/**
 * @swagger
 * /api/coach-users/{id}:
 *   patch:
 *     tags: [CoachUsers]
 *     summary: Update coach-user relation
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *                 enum: [active, blocked, pending]
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Relation updated
 *       404:
 *         description: Relation not found
 *       500:
 *         description: Failed to update relation
 */
router.patch('/:id', authenticateToken, isCoach, coachUserController.updateCoachUser);

/**
 * @swagger
 * /api/coach-users/{id}:
 *   delete:
 *     tags: [CoachUsers]
 *     summary: Delete coach-user relation
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
 *         description: Relation deleted
 *       404:
 *         description: Relation not found
 *       500:
 *         description: Failed to delete relation
 */
router.delete('/:id', authenticateToken, isCoach, coachUserController.deleteCoachUser);

/**
 * @swagger
 * /api/coach-user/coach-of-user/{userId}:
 *   get:
 *     summary: Lấy thông tin coach của một user
 *     tags:
 *       - CoachUser
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của user
 *     responses:
 *       200:
 *         description: Thông tin coach của user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 coach:
 *                   type: object
 *                   description: Thông tin coach (tùy theo cấu trúc trả về thực tế)
 *       404:
 *         description: Không tìm thấy user hoặc coach
 *       500:
 *         description: Lỗi server
 */
router.get('/coach-of-user/:userId', coachUserController.getCoachByUserId);
module.exports = router;
