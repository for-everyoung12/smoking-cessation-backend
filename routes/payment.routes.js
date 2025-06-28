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

/**
 * @swagger
 * /api/payments/paypal/return:
 *   get:
 *     summary: Xử lý chuyển hướng khi thanh toán PayPal thành công
 *     tags: [PayPal]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         description: Token từ PayPal
 *       - in: query
 *         name: PayerID
 *         schema:
 *           type: string
 *         description: ID người thanh toán từ PayPal
 *     responses:
 *       302:
 *         description: Chuyển hướng về ứng dụng di động
 */
router.get('/paypal/return', (req, res) => {
    const { token, PayerID } = req.query;
    // Chuyển hướng đến deep link của app, giữ nguyên các tham số
    res.redirect(`quitsmokingapp://checkout/success?token=${token}&PayerID=${PayerID}`);
});

/**
 * @swagger
 * /api/payments/paypal/cancel:
 *   get:
 *     summary: Xử lý khi người dùng hủy thanh toán PayPals
 *     tags: [PayPal]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         description: Token từ PayPal
 *     responses:
 *       302:
 *         description: Chuyển hướng về ứng dụng di động
 */
router.get('/paypal/cancel', (req, res) => {
    const { token } = req.query;
    // Chuyển hướng đến deep link của app
    res.redirect(`quitsmokingapp://checkout/cancel?token=${token}`);
});



module.exports = router;
