const cron = require("node-cron");
const { exec } = require("child_process");

console.log("Scheduler đang chạy...");

// ⏱️ Membership: mỗi giờ 1 lần
cron.schedule("0 * * * *", () => {
  console.log(`⌛ Expire memberships @ ${new Date().toLocaleString()}`);
  exec("node cron/expireMemberships.js", (error, stdout, stderr) => {
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    if (error) console.error("❌ expireMemberships error:", error.message);
  });
});

// 🔁 Reminder: mỗi phút
cron.schedule("* * * * *", () => {
  console.log(`🔔 Process reminders @ ${new Date().toLocaleString()}`);
  exec("node cron/processReminders.js", (error, stdout, stderr) => {
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    if (error) console.error("❌ processReminders error:", error.message);
  });
});
