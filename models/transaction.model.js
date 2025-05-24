const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  type: String, 
  enum: [
      'membership_payment',
    ],
  related_payment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  description: String,
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'success'
  },
  created_at: { type: Date, default: Date.now }
});
const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;