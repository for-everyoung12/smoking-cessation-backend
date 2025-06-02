// routes/transaction.routes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/transaction.controller');
const authenticateToken = require('../middlewares/auth.middleware');
const { isAdmin } = require('../middlewares/role.middleware');

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Lịch sử và quản lý giao dịch
 */

/**
 * @swagger
 * /api/transactions/me:
 *   get:
 *     summary: Lấy lịch sử giao dịch của bản thân
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách giao dịch cá nhân
 */
router.get('/me', authenticateToken, controller.getMyTransactions);

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Lấy tất cả giao dịch (admin)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách giao dịch toàn hệ thống
 */
router.get('/', authenticateToken, isAdmin, controller.getAllTransactions);

module.exports = router;
