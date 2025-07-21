const cron = require("node-cron");
const User = require("../models/user.model");
const { sendNotification } = require("../utils/notify");
const sendEmail = require("../utils/sendmail");

function getMotivationalMessage() {
  const messages = [
    "A new day – a new chance to conquer yourself! ",
    "You're doing great. Don't give up! ",
    "Each smoke-free day brings you closer to a healthier life.",
    "Consistency is key. You’ve got this! ",
    "Remember: you're not alone – we're here to support you "
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}


cron.schedule("0 7 * * *", async () => {
  console.log("[Cron]  Sending daily motivation at 7:00 VN");

  try {
    const users = await User.find({});
    for (const user of users) {
      const message = getMotivationalMessage();
      await sendNotification(user._id, " Daily Motivation", message);
      if (user.email) {
        await sendEmail(
          user.email,
          " Start your day with motivation!",
          `<p>${message}</p><p>Keep going – you're doing great!</p>`
        );
      }
    }
    console.log(`[Cron]  Motivation sent to ${users.length} users`);
  } catch (error) {
    console.error("[Cron]  Error sending motivation:", error);
  }
}, {
  timezone: "Asia/Ho_Chi_Minh"
});
