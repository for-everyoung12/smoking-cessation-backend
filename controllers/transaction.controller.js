// controllers/transaction.controller.js
const service = require('../services/transaction.service');

exports.getMyTransactions = async (req, res) => {
  try {
    const transactions = await service.getMyTransactions(req.user.id);
    res.json(transactions);
  } catch (err) {
    console.error('[Get My Transactions Error]', err);
    res.status(500).json({ message: 'Không lấy được lịch sử giao dịch của bạn' });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await service.getAllTransactions();
    res.json(transactions);
  } catch (err) {
    console.error('[Get All Transactions Error]', err);
    res.status(500).json({ message: 'Không lấy được giao dịch toàn hệ thống' });
  }
};
exports.getTransactionSummary = async (req, res) => {
  try {
    const summary = await service.getAllTransactionSummary();
    res.json(summary);
  } catch (err) {
    console.error('[Get Transaction Summary Error]', err);
    res.status(500).json({ message: 'Không lấy được thống kê giao dịch' });
  }
};
