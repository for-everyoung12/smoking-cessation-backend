const Badge = require('../models/badge.model');
const UserBadge = require('../models/userBadge.model');

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
<<<<<<< Updated upstream
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { name, type, date, description, proOnly, condition } = req.body;
        // condition: { type, value, unit, description }
        const badge = new Badge({ name, type, date, description, proOnly, condition });
=======
        const { name, type, date, description, condition, proOnly} = req.body;
        const badge = new Badge({name, type, date, description, condition, proOnly});
>>>>>>> Stashed changes
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