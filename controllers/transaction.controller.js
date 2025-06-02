// controllers/transaction.controller.js
const service = require('../services/transaction.service');

exports.getMyTransactions = async (req, res) => {
  try {
    const transactions = await service.getMyTransactions(req.user._id);
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
