const Badge = require('../models/badge.model');
const UserBadge = require('../models/userBadge.model');
const mongoose = require('mongoose');
// Lấy tất cả badge (kèm user_id)
exports.getAllBadges = async (req, res) => {
    try {
        const badges = await Badge.find();
        res.json({ user_id: req.user?._id, badges });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lấy badge theo ID (kèm user_id)
exports.getBadgeById = async (req, res) => {
    try {
        const badge = await Badge.findById(req.params.id);
        if (!badge) return res.status(404).json({ message: 'Badge not found' });
        res.json({ user_id: req.user?._id, badge });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Tạo badge mới và gán cho user
exports.createBadge = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { name, type, date, description, proOnly, condition } = req.body;
        // condition: { type, value, unit, description }
        const badge = new Badge({ name, type, date, description, proOnly, condition });
        await badge.save();

        // Gán badge cho user
        const userBadge = new UserBadge({
            user_id: userId,
            badge_id: badge._id,
            granted_date: new Date()
        });
        await userBadge.save();

        res.status(201).json({ user_id: userId, badge });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Cập nhật badge (kèm user_id)
exports.updateBadge = async (req, res) => {
    try {
        const badge = await Badge.findOneAndUpdate(
            { _id: req.params.id },
            req.body,
            { new: true }
        );
        if (!badge) return res.status(404).json({ message: 'Badge not found' });
        res.json({ user_id: req.user?._id, badge });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Xóa badge (kèm user_id)
exports.deleteBadge = async (req, res) => {
    try {
        await Badge.findByIdAndDelete(req.params.id);
        // Xóa luôn userBadge liên quan
        await UserBadge.deleteMany({ badge_id: req.params.id });
        res.json({ user_id: req.user?._id, message: 'Badge deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


exports.getUserBadges = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);
    const userBadges = await UserBadge.find({ user_id: userObjectId }).populate('badge_id');

    res.json({
      badges: userBadges.map(ub => ({
        ...ub.badge_id.toObject(),
        granted_date: ub.granted_date
      }))
    });
  } catch (err) {
    console.error('[getUserBadges]', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getUpcomingBadges = async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(req.user.id);
      
      // Lấy danh sách badge user đã đạt
      const userBadges = await UserBadge.find({ user_id: userId }).select('badge_id');
      const achievedIds = userBadges.map(ub => ub.badge_id);
  
      // Lấy badge chưa đạt
      const upcomingBadges = await Badge.find({ _id: { $nin: achievedIds } });
  
      res.json({ badges: upcomingBadges });
    } catch (err) {
      console.error('[getUpcomingBadges]', err);
      res.status(500).json({ error: err.message });
    }
  };
  exports.getBadgeSummary = async (req, res) => {
    try {
      const userId = new mongoose.Types.ObjectId(req.user.id);
  
      const totalBadges = await Badge.countDocuments();
      const achievedBadges = await UserBadge.countDocuments({ user_id: userId });
      const upcomingBadges = totalBadges - achievedBadges;
  
      const completionRate = totalBadges > 0 
        ? Math.round((achievedBadges / totalBadges) * 100)
        : 0;
  
      res.json({
        badge_achieved_count: achievedBadges,
        badge_upcoming_count: upcomingBadges,
        completion_rate: completionRate
      });
    } catch (err) {
      console.error('[getBadgeSummary]', err);
      res.status(500).json({ error: err.message });
    }
  };