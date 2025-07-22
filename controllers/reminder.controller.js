const Reminder = require("../models/reminder.model");
// Tạo mới reminder
exports.createReminder = async (req, res) => {
  try {
    const { title, content, remind_at, is_recurring, repeat_pattern, plan_id } = req.body;

    const remindTime = new Date(remind_at);
    const now = new Date();

    if (isNaN(remindTime.getTime()) || remindTime < now) {
      return res.status(400).json({ message: "Invalid or past remind_at" });
    }

    const reminder = await Reminder.create({
      user_id: req.user.id,
      plan_id: plan_id || null,
      title,
      content,
      remind_at: remindTime, // ISO UTC string được xử lý đúng
      is_recurring: !!is_recurring,
      repeat_pattern: repeat_pattern || null
    });

    res.status(201).json({
      message: "Reminder created",
      reminder: {
        _id: reminder._id,
        title: reminder.title,
        remind_at: reminder.remind_at,
        is_recurring: reminder.is_recurring,
        repeat_pattern: reminder.repeat_pattern
      }
    });
  } catch (error) {
    console.error("[createReminder]", error);
    res.status(500).json({ message: "Failed to create reminder" });
  }
};


// Lấy tất cả reminder của người dùng
exports.getMyReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ user_id: req.user.id }).sort({ remind_at: 1 });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reminders" });
  }
};

// Xoá reminder
exports.deleteReminder = async (req, res) => {
  try {
    const deleted = await Reminder.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user.id
    });
    if (!deleted) return res.status(404).json({ message: "Reminder not found" });
    res.json({ message: "Reminder deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete reminder" });
  }
};

// Cập nhật reminder
exports.updateReminder = async (req, res) => {
  try {
    const { title, content, remind_at, is_recurring, repeat_pattern } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (remind_at !== undefined) {
      const remindTime = new Date(remind_at);
      if (isNaN(remindTime.getTime()) || remindTime < new Date()) {
        return res.status(400).json({ message: "Invalid or past remind_at" });
      }
      updateData.remind_at = remindTime;
    }
    if (is_recurring !== undefined) updateData.is_recurring = is_recurring;
    if (repeat_pattern !== undefined) updateData.repeat_pattern = repeat_pattern;

    const updated = await Reminder.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      updateData,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Reminder not found" });
    res.json({ message: "Reminder updated", reminder: updated });
  } catch (error) {
    console.error("[updateReminder]", error);
    res.status(500).json({ message: "Failed to update reminder" });
  }
};
