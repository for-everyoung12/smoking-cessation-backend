const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedback.controller');
const authenticateToken = require('../middlewares/auth.middleware');  // JWT auth middleware

/**
 * @swagger
 * tags:
 *   - name: Feedback
 *     description: API to manage feedback for coaches
 */

/**
 * @swagger
 * /api/feedback/coach:
 *   post:
 *     tags: [Feedback]
 *     summary: Create feedback for a coach
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [coach_user_id, rating, comment]
 *             properties:
 *               coach_user_id:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 enum: [1, 2, 3, 4, 5]
 *               comment:
 *                 type: string
 *               is_deleted:
 *                 type: boolean
 *                 description: Set to true for soft delete
 *     responses:
 *       201:
 *         description: Feedback created successfully
 *       400:
 *         description: Bad request (invalid data)
 *       500:
 *         description: Internal server error
 */
router.post('/coach', authenticateToken, feedbackController.feedbackCoach);

/**
 * @swagger
 * /api/feedback/coach/{coach_user_id}:
 *   get:
 *     tags: [Feedback]
 *     summary: Get feedback for a specific coach
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: coach_user_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the coach to get feedback for
 *     responses:
 *       200:
 *         description: List of feedback for the coach
 *       404:
 *         description: Coach not found
 *       500:
 *         description: Internal server error
 */
router.get('/coach/:coach_user_id', authenticateToken, feedbackController.getFeedbackForCoach);

/**
 * @swagger
 * /api/feedback/coach/{feedback_id}:
 *   put:
 *     tags: [Feedback]
 *     summary: Update feedback for a coach
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feedback_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the feedback to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *               comment:
 *                 type: string
 *               is_deleted:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Feedback updated successfully
 *       404:
 *         description: Feedback not found
 *       500:
 *         description: Internal server error
 */
router.put('/coach/:feedback_id', authenticateToken, feedbackController.updateFeedbackCoach);

/**
 * @swagger
 * /api/feedback/coach/{feedback_id}:
 *   delete:
 *     tags: [Feedback]
 *     summary: Delete feedback for a coach (soft delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feedback_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the feedback to delete
 *     responses:
 *       200:
 *         description: Feedback successfully deleted (soft delete)
 *       404:
 *         description: Feedback not found
 *       500:
 *         description: Internal server error
 */
router.delete('/coach/:feedback_id', authenticateToken, feedbackController.deleteFeedbackCoach);

/**
 * @swagger
 * /api/feedback/coach-of-user/{userId}:
 *   get:
 *     tags: [Feedback]
 *     summary: Get coach's feedback for a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to get their coach's feedback
 *     responses:
 *       200:
 *         description: Feedback for the user’s coach
 *       404:
 *         description: No coach or feedback found
 *       500:
 *         description: Internal server error
 */
router.get('/coach-of-user/:userId', authenticateToken, feedbackController.getCoachByUserId);

module.exports = router;
