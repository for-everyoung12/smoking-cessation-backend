// services/transaction.service.js
const Transaction = require('../models/transaction.model');

exports.createTransaction = async (userId, amount, type, paymentId, description = '') => {
  return await Transaction.create({
    user_id: userId,
    amount,
    type,
    related_payment_id: paymentId,
    description,
    status: 'success'
  });
};

exports.getMyTransactions = async (userId) => {
  return await Transaction.find({ user_id: userId })
    .populate('related_payment_id', 'payment_method transaction_id status')
    .sort({ created_at: -1 });
};

exports.getAllTransactions = async () => {
  return await Transaction.find()
    .populate('user_id', 'email username')
    .populate('related_payment_id', 'payment_method amount status')
    .sort({ created_at: -1 });
};
exports.getAllTransactionSummary = async () => {
  const transactions = await Transaction.find();

  const summary = {
    totalRevenue: 0,
    success: 0,
    pending: 0,
    failed: 0
  };

  for (const tx of transactions) {
    if (tx.status === 'success') {
      summary.totalRevenue += tx.amount;
    }
    summary[tx.status] += 1;
  }

  return summary;
};
