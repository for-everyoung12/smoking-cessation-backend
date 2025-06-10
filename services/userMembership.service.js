// services/userMembership.service.js
const UserMembership = require('../models/userMembership.model');
const MembershipPackage = require('../models/membershipPackage.model');

exports.getCurrentMembership = async (userId) => {
  return await UserMembership.findOne({
    user_id: userId,
    status: 'active',
    expire_date: { $gte: new Date() }
  }).populate('package_id');
};

exports.getAllMemberships = async () => {
  return await UserMembership.find()
    .populate('user_id', 'username email')
    .populate('package_id');
};

exports.getMembershipsByUser = async (userId) => {
  return await UserMembership.find({ user_id: userId })
    .populate('package_id')
    .sort({ payment_date: -1 });
};
