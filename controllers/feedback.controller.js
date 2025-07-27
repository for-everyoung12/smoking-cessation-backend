const mongoose = require('mongoose');
const Feedback = require('../models/feedback.model');

// Tạo feedback cho huấn luyện viên
exports.feedbackCoach = async (req, res) => {
    try {
        // Lấy user_id từ token đã decode (req.user), KHÔNG lấy từ body
        const userId = req.user?._id || req.user?.id;
        const { coach_user_id, rating, comment, is_deleted } = req.body;

        if (!coach_user_id || !rating || !comment) {
            return res.status(400).json({ error: 'Missing required fields!' });
        }

        const feedback = new Feedback({
            user_id: userId,
            coach_user_id,
            rating,
            comment,
            created_at: new Date(),
            updated_at: new Date(),
            is_deleted: is_deleted || false
        });

        await feedback.save();

        // Populate ngay khi trả về để FE render tức thì tên người gửi feedback
        await feedback.populate('user_id', 'full_name avatar');
        res.status(201).json(feedback);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lấy tất cả feedback của huấn luyện viên
exports.getFeedbackForCoach = async (req, res) => {
    try {
        const feedbacks = await Feedback.find({
            coach_user_id: req.params.coach_user_id,
            is_deleted: false
        }).populate('user_id', 'full_name avatar email');
        res.json(feedbacks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Cập nhật feedback
exports.updateFeedbackCoach = async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndUpdate(
            req.params.feedback_id,
            req.body,
            { new: true }
        ).populate('user_id', 'full_name avatar');
        if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
        res.json(feedback);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Xóa feedback (đánh dấu xóa)
exports.deleteFeedbackCoach = async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.feedback_id);
        if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

        feedback.is_deleted = true;
        await feedback.save();
        res.json({ message: 'Feedback successfully deleted.', feedback_id: feedback._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Lấy feedback của coach theo userId (ai đã feedback coach này)
exports.getCoachByUserId = async (req, res) => {
    try {
        const feedbacks = await Feedback.find({
            user_id: req.params.userId,
            is_deleted: false
        }).populate('user_id', 'full_name avatar email');
        res.json(feedbacks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
