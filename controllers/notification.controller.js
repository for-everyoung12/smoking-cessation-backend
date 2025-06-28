const Notification = require("../models/notification.model");

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user.id }).sort({ sent_at: -1 });
    res.json(notifications);
  } catch (error) {
    console.error("[getMyNotifications]", error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    // Optionally add read status in schema to support this
    res.status(200).json({ message: "Marked all as read (mock)" });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark notifications" });
  }
};

exports.markAsRead = async (req, res) => {
    try {
      const updated = await Notification.findOneAndUpdate(
        { _id: req.params.id, user_id: req.user.id },
        { is_read: true },
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: "Notification not found" });
      res.json({ message: "Notification marked as read", notification: updated });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark as read" });
    }
  };
  
exports.deleteNotification = async (req, res) => {
  try {
    const deleted = await Notification.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user.id,
    });

    if (!deleted) return res.status(404).json({ message: "Notification not found" });

    res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("[deleteNotification]", error);
    res.status(500).json({ message: "Failed to delete notification" });
  }
};
exports.clearAllNotifications = async (req, res) => {
    try {
      await Notification.deleteMany({ user_id: req.user.id });
      res.status(200).json({ message: "Đã xoá tất cả thông báo." });
    } catch (err) {
      res.status(500).json({ message: "Lỗi xoá tất cả", error: err.message });
    }
  };
  
