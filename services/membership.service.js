const MembershipPackage = require('../models/membershipPackage.model');

exports.create = async (data) => {
  return await MembershipPackage.create(data);
};

exports.getAll = async () => {
  return await MembershipPackage.find();
};

exports.getById = async (id) => {
  return await MembershipPackage.findById(id);
};

exports.update = async (id, data) => {
  return await MembershipPackage.findByIdAndUpdate(id, data, { new: true });
};

exports.remove = async (id) => {
  return await MembershipPackage.findByIdAndDelete(id);
};
