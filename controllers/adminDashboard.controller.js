const User = require('../models/user.model');
const UserMembership = require('../models/userMembership.model');
const BadgeAward = require('../models/badge.model');
const ActivityLog = require('../models/activityLog.model');
const Reminder = require("../models/reminder.model");

exports.getAdminDashboardStats = async (req, res) => {
  try {
    const [userCount, membershipCount, coachCount, badgeCount] = await Promise.all([
      User.countDocuments(),
      UserMembership.countDocuments({ status: 'active' }),
      User.countDocuments({ role: 'coach' }),
      BadgeAward.countDocuments(),
    ]);

    // ✅ Populate user full_name + email
    const recentActivities = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user_id', 'full_name email');

    res.json({
      stats: [
        {
          title: 'Total Users',
          value: userCount,
          change: '0%',
          trend: 'up',
        },
        {
          title: 'Active Memberships',
          value: membershipCount,
          change: '0%',
          trend: 'up',
        },
        {
          title: 'Active Coaches',
          value: coachCount,
          change: '0%',
          trend: 'up',
        },
        {
          title: 'Badges Awarded',
          value: badgeCount,
          change: '0%',
          trend: 'up',
        },
      ],
      recentActivities: recentActivities.map((log) => ({
        message: log.message,
        time: log.createdAt,
        status: log.status,
        user:
          log.user_id?.full_name ||
          log.user_id?.email ||
          'System',
      })),
    });
  } catch (error) {
    console.error('[getAdminDashboardStats]', error);
    res.status(500).json({ message: 'Failed to load dashboard data' });
  }
};
exports.sendReminderToUsers = async (req, res) => {
  try {
    const { user_ids, title, content, remind_at, is_recurring, repeat_pattern } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Chỉ admin mới được phép gửi reminder" });
    }

    if (!Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({ message: "Danh sách user_ids không hợp lệ" });
    }

    const reminders = [];

    for (const userId of user_ids) {
      const reminder = await Reminder.create({
        user_id: userId,
        title,
        content,
        remind_at,
        is_recurring,
        repeat_pattern,
      });

      reminders.push(reminder);
    }

    res.status(200).json({
      message: `Đã gửi reminder đến ${reminders.length} người dùng`,
      reminders,
    });
  } catch (error) {
    console.error("[Admin Send Reminder]", error);
    res.status(500).json({ message: "Gửi reminder thất bại" });
  }
};