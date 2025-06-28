// cron/processReminders.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Reminder = require("../models/reminder.model");
const Notification = require("../models/notification.model");
const sendEmail = require("../utils/sendmail");
const User = require("../models/user.model");

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

    for (const reminder of reminders) {
      const user = await User.findById(reminder.user_id);
      if (!user) continue;

      // Gửi notification
      await Notification.create({
        user_id: user._id,
        title: reminder.title,
        content: reminder.content,
        sent_at: new Date(),
        type: "reminder"
      });

      // Gửi email
      await sendEmail(user.email, `[Reminder] ${reminder.title}`, `<p>${reminder.content}</p>`);

      // Nếu là recurring thì cập nhật remind_at
      if (reminder.is_recurring && reminder.repeat_pattern === "daily") {
        reminder.remind_at.setDate(reminder.remind_at.getDate() + 1);
        await reminder.save();
      } else {
        await Reminder.findByIdAndDelete(reminder._id);
      }
    }

    console.log(`Đã xử lý ${reminders.length} reminder lúc ${now.toLocaleString()}`);
  } catch (error) {
    console.error("[processReminders]", error);
  } finally {
    await mongoose.disconnect();
  }
}

processReminders();
