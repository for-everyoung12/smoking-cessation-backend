const express = require('express');
const stageRouter = express.Router();
const quitStageController = require('../controllers/quitState.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const { verifyPlanOwnership } = require('../middlewares/planOwnership.middleware');
const { isCoach } = require('../middlewares/role.middleware');
/**
 * @swagger
 * tags:
 *   name: QuitStages
 *   description: Quản lý các giai đoạn cai thuốc trong kế hoạch
 */

/**
 * @swagger
 * /api/quit-plans/{planId}/stages:
 *   get:
 *     summary: Lấy danh sách các giai đoạn theo kế hoạch
 *     tags: [QuitStages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của kế hoạch cai thuốc
 *     responses:
 *       200:
 *         description: Danh sách giai đoạn trả về thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/QuitStage'
 *       500:
 *         description: Lỗi server
 */
stageRouter.get(
  '/:planId/stages',
  authenticateToken,
  verifyPlanOwnership,
  quitStageController.getStagesByPlan
);

/**
 * @swagger
 * /api/quit-plans/{planId}/stages:
 *   post:
 *     summary: Tạo giai đoạn mới cho kế hoạch cai thuốc
 *     tags: [QuitStages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của kế hoạch cai thuốc
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên giai đoạn
 *               description:
 *                 type: string
 *                 description: Mô tả giai đoạn
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: Ngày bắt đầu giai đoạn
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: Ngày kết thúc giai đoạn
 *               status:
 *                 type: string
 *                 enum: [not_started, in_progress, completed, skipped]
 *                 description: Trạng thái giai đoạn
 *     responses:
 *       201:
 *         description: Giai đoạn tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuitStage'
 *       500:
 *         description: Lỗi server
 */
stageRouter.post(
  '/:planId/stages',
  authenticateToken,
  isCoach,
  verifyPlanOwnership,
  quitStageController.createStage
);

/**
 * @swagger
 * /api/quit-plans/{planId}/stages/{stageId}:
 *   patch:
 *     summary: Cập nhật giai đoạn theo ID
 *     tags: [QuitStages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của kế hoạch cai thuốc
 *       - in: path
 *         name: stageId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của giai đoạn cần cập nhật
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên giai đoạn
 *               description:
 *                 type: string
 *                 description: Mô tả giai đoạn
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: Ngày bắt đầu giai đoạn
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: Ngày kết thúc giai đoạn
 *               status:
 *                 type: string
 *                 enum: [not_started, in_progress, completed, skipped]
 *                 description: Trạng thái giai đoạn
 *     responses:
 *       200:
 *         description: Cập nhật giai đoạn thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuitStage'
 *       404:
 *         description: Giai đoạn không tồn tại
 *       500:
 *         description: Lỗi server
 */
stageRouter.patch(
  '/:planId/stages/:stageId',
  authenticateToken,
  isCoach,
  verifyPlanOwnership,
  quitStageController.updateStage
);

/**
 * @swagger
 * /api/quit-plans/{planId}/stages/{stageId}:
 *   delete:
 *     summary: Xoá giai đoạn theo ID
 *     tags: [QuitStages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của kế hoạch cai thuốc
 *       - in: path
 *         name: stageId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của giai đoạn cần xoá
 *     responses:
 *       200:
 *         description: Xoá giai đoạn thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Stage deleted
 *       404:
 *         description: Giai đoạn không tồn tại
 *       500:
 *         description: Lỗi server
 */
stageRouter.delete(
  '/:planId/stages/:stageId',
  authenticateToken,
  isCoach,
  verifyPlanOwnership,
  quitStageController.deleteStage
);

module.exports = stageRouter;

/**
 * @swagger
 * components:
 *   schemas:
 *     QuitStage:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID của giai đoạn
 *         plan_id:
 *           type: string
 *           description: ID kế hoạch cai thuốc
 *         name:
 *           type: string
 *           description: Tên giai đoạn
 *         description:
 *           type: string
 *           description: Mô tả chi tiết giai đoạn
 *         start_date:
 *           type: string
 *           format: date
 *           description: Ngày bắt đầu giai đoạn
 *         end_date:
 *           type: string
 *           format: date
 *           description: Ngày kết thúc giai đoạn
 *         status:
 *           type: string
 *           enum: [not_started, in_progress, completed, skipped]
 *           description: Trạng thái giai đoạn
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Ngày tạo bản ghi
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Ngày cập nhật bản ghi
 */
