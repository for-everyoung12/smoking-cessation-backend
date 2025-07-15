// cron/processReminders.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Reminder = require("../models/reminder.model");
const Notification = require("../models/notification.model");
const sendEmail = require("../utils/sendmail");
const User = require("../models/user.model");
const { getSocketIO } = require("../utils/notify");

dotenv.config();

async function processReminders() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const now = new Date();
    const reminders = await Reminder.find({
      remind_at: { $lte: now }
    });

    const io = getSocketIO();

    for (const reminder of reminders) {
      const user = await User.findById(reminder.user_id);
      if (!user) {
        console.warn("⚠️ Không tìm thấy user:", reminder.user_id);
        continue;
      }

      const notificationData = {
        user_id: user._id,
        title: reminder.title,
        content: reminder.content,
        sent_at: new Date(),
        type: "reminder",
        is_read: false
      };

      io.to(user._id.toString()).emit("newNotification", notificationData);

      await Notification.create(notificationData);

      await sendEmail(
        user.email,
        `[Reminder] ${reminder.title}`,
        `<p>${reminder.content}</p>`
      );

      if (reminder.is_recurring) {
        switch (reminder.repeat_pattern) {
          case "daily":
            reminder.remind_at.setDate(reminder.remind_at.getDate() + 1);
            break;
          case "weekly":
            reminder.remind_at.setDate(reminder.remind_at.getDate() + 7);
            break;
          case "monthly":
            reminder.remind_at.setMonth(reminder.remind_at.getMonth() + 1);
            break;
          default:
            console.warn("❌ Repeat pattern không hợp lệ:", reminder.repeat_pattern);
            await Reminder.findByIdAndDelete(reminder._id);
            continue;
        }
        await reminder.save();
      } else {
        await Reminder.findByIdAndDelete(reminder._id);
      }
    }

  
  } catch (error) {
    console.error("[processReminders]", error);
  } 
}

module.exports = processReminders;
