// controllers/userMembership.controller.js
const service = require('../services/userMembership.service');
const UserMembership = require("../models/userMembership.model");

exports.getCurrentMembership = async (req, res) => {
  try {
    const membership = await service.getCurrentMembership(req.user.id);
    if (!membership) return res.status(404).json({ message: 'No active membership found' });
    res.json(membership);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch current membership', error: err.message });
  }
};

exports.getMyMembershipHistory = async (req, res) => {
  try {
    const history = await service.getMembershipsByUser(req.user.id);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch membership history' });
  }
};

exports.getAllMemberships = async (req, res) => {
  try {
    const all = await service.getAllMemberships();
    res.json(all);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch all memberships' });
  }
};

exports.getMembershipByUserId = async (req, res) => {
  try {
    const membership = await UserMembership.findOne({
      user_id: req.params.id,
      status: 'active',
      $or: [
        { expire_date: null },
        { expire_date: { $gte: new Date() } }
      ]
    }).populate('package_id');

    if (!membership) return res.status(404).json({ message: 'No active membership found' });
    res.json(membership);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch membership' });
  }
};

exports.previewUpgrade = async (req, res) => {
  try {
    const { newPackageId } = req.body;
    if (!newPackageId) return res.status(400).json({ message: 'Missing newPackageId' });

    const result = await service.calculateUpgradeCost(req.user.id, newPackageId);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
