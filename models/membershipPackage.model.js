const mongoose = require('mongoose');

const membershipPackageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['default', 'pro'], required: true },
  description: String,
  duration_days: { type: Number, required: true },
  price: { type: Number, required: true },
  can_message_coach: Boolean,
  can_assign_coach: Boolean,
  can_use_quitplan: Boolean,
  can_use_reminder: Boolean,
  can_earn_special_badges: Boolean,
});

const MembershipPackage = mongoose.model('MembershipPackage', membershipPackageSchema);
module.exports = MembershipPackage;