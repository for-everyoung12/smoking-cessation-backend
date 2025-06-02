const Badge = require('../models/badge.model'); // Adjust path as needed

// Get all badges
exports.getAllBadges = async (req, res) => {
    try {
        const badges = await Badge.find();
        res.json(badges);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get badge by ID
exports.getBadgeById = async (req, res) => {
    try {
        const badge = await Badge.findById(req.params.id);
        if (!badge) return res.status(404).json({ message: 'Badge not found' });
        res.json(badge);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a new badge
exports.createBadge = async (req, res) => {
    try {
        const { name, type, date, description, condition } = req.body;
        const badge = new Badge({name, type, date, description, condition});
        await badge.save();
        res.status(201).json(badge);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Update a badge
exports.updateBadge = async (req, res) => {
    try {
        const badge = await Badge.findOneAndUpdate(
            { _id: req.params.id }, 
            req.body,
            { new: true }
        );
        if (!badge) return res.status(404).json({ message: 'Badge not found' });
        res.json(badge);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Delete a badge
exports.deleteBadge = async (req, res) => {
    try {
        const badge = await Badge.findByIdAndDelete(req.params.id);
        res.json({ message: 'Badge deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};