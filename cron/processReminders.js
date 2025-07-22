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

    const now = new Date(); // UTC
    const gracePeriodMs = 60 * 1000;
    const from = new Date(now.getTime() - gracePeriodMs);

    const reminders = await Reminder.find({
      remind_at: { $gte: from, $lte: now },
      is_sent: false
    });

    const io = getSocketIO();

    for (const reminder of reminders) {

      const locked = await Reminder.findOneAndUpdate(
        { _id: reminder._id, is_sent: false },
        { is_sent: true },
        { new: true }
      );

      if (!locked) {
        continue;
      }

      const user = await User.findById(reminder.user_id);
      if (!user) {
        console.warn(" Không tìm thấy user:", reminder.user_id);
        continue;
      }

      const notificationData = {
        user_id: user._id,
        title: reminder.title,
        content: reminder.content,
        sent_at: new Date(),
        type: "reminder",
        is_read: false,
      };

     
      io.to(user._id.toString()).emit("newNotification", notificationData);

      await Promise.all([
        Notification.create(notificationData),
        sendEmail(
          user.email,
          `[Reminder] ${reminder.title}`,
          `<p>${reminder.content}</p>`
        ),
      ]);

      
      if (reminder.is_recurring && reminder.repeat_pattern) {
        let nextDate = new Date(reminder.remind_at);

        switch (reminder.repeat_pattern) {
          case "daily":
            nextDate.setDate(nextDate.getDate() + 1);
            break;
          case "weekly":
            nextDate.setDate(nextDate.getDate() + 7);
            break;
          case "monthly":
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
          default:
            console.warn("Repeat pattern không hợp lệ:", reminder.repeat_pattern);
            continue;
        }


        if (nextDate > now) {
          await Reminder.updateOne(
            { _id: reminder._id },
            {
              remind_at: nextDate,
              is_sent: false
            }
          );
        } else {
          console.warn(`⚠ Reminder ${reminder._id} có nextDate <= now, bỏ qua không cập nhật`);
        }
      } else {
        // 🗑 Xoá nếu không lặp
        await Reminder.findByIdAndDelete(reminder._id);
      }
    }
  } catch (error) {
    console.error("[processReminders]", error);
  }
}

module.exports = processReminders;
