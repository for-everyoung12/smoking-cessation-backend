// routes/paypal.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/payment.controller');
const authenticateToken = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: PayPal
 *   description: Tích hợp thanh toán qua PayPal
 */

/**
 * @swagger
 * /api/payments/paypal/create:
 *   post:
 *     summary: Tạo đơn thanh toán PayPal
 *     tags: [PayPal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               package_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Link để người dùng thanh toán
 */
router.post('/paypal/create', authenticateToken, controller.createPaypalOrder);

/**
 * @swagger
 * /api/payments/paypal/capture:
 *   post:
 *     summary: Xác nhận thanh toán PayPal
 *     tags: [PayPal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thanh toán thành công và gán membership
 */
router.post('/paypal/capture', authenticateToken, controller.capturePaypalOrder);

module.exports = router;
