const Reminder = require("../models/reminder.model");
const Notification = require("../models/notification.model");
const sendEmail = require("../utils/sendmail"); // sửa lại đường dẫn nếu cần
const User = require("../models/user.model");

exports.createReminder = async (req, res) => {
  try {
    const { title, content, remind_at, is_recurring, repeat_pattern } = req.body;

    const reminder = await Reminder.create({
      user_id: req.user.id,
      title,
      content,
      remind_at: new Date(remind_at),
      is_recurring: !!is_recurring,
      repeat_pattern: repeat_pattern || null
    });

    res.status(201).json({ message: "Reminder created", reminder });
  } catch (error) {
    console.error("[createReminder]", error);
    res.status(500).json({ message: "Failed to create reminder" });
  }
};

exports.getMyReminders = async (req, res) => {
  try {
    const reminders = await Reminder.find({ user_id: req.user.id });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reminders" });
  }
};

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
