const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  package_id: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPackage' },
  amount: Number,
  payment_date: Date,
  payment_method: String,
  status: { type: String, enum: ['pending', 'success', 'failed'] },
  transaction_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  note: String
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;