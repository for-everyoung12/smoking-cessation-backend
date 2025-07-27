const UserMembership = require('../models/userMembership.model');
const MembershipPackage = require('../models/membershipPackage.model');

exports.getCurrentMembership = async (userId) => {
  return await UserMembership.findOne({
    user_id: userId,
    status: 'active',
    expire_date: { $gte: new Date() }
  })
    .populate('user_id', 'username email')
    .populate('package_id');
};

exports.getAllMemberships = async () => {
  return await UserMembership.find()
    .populate('user_id', 'username email')
    .populate('package_id');
};

exports.getMembershipsByUser = async (userId) => {
  return await UserMembership.find({ user_id: userId })
    .populate('user_id', 'username email')
    .populate('package_id')
    .sort({ payment_date: -1 });
};

// Tính chi phí nâng cấp
exports.calculateUpgradeCost = async (userId, newPackageId) => {
  const currentMembership = await UserMembership.findOne({
    user_id: userId,
    status: 'active',
    expire_date: { $gte: new Date() }
  }).populate('package_id');

  if (!currentMembership) throw new Error('Không có gói hiện tại đang hoạt động');

  const newPackage = await MembershipPackage.findById(newPackageId);
  if (!newPackage) throw new Error('Không tìm thấy gói nâng cấp');

  const now = new Date();
  const remainingDays = Math.ceil((currentMembership.expire_date - now) / (1000 * 60 * 60 * 24));
  const currentRate = currentMembership.package_id.price / currentMembership.package_id.duration_days;
  const remainingValue = currentRate * remainingDays;
  const upgradeCost = newPackage.price - remainingValue;

  return {
    from: currentMembership.package_id.name,
    to: newPackage.name,
    remainingDays,
    remainingValue: Math.round(remainingValue),
    upgradeCost: Math.max(0, Math.round(upgradeCost)),
    totalCost: newPackage.price
  };
};
