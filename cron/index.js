const cron = require("node-cron");
const processReminders = require("./processReminders");
const { exec } = require("child_process");

cron.schedule("0 * * * *", () => {
  console.log(`⌛ Expire memberships @ ${new Date().toLocaleString()}`);
  exec("node cron/expireMemberships.js", (error, stdout, stderr) => {
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    if (error) console.error("❌ expireMemberships error:", error.message);
  });
});

// 🔁 Reminder: mỗi phút (CHUYỂN sang gọi trực tiếp)
cron.schedule("* * * * *", async () => {
  console.log(`🔔 Process reminders @ ${new Date().toLocaleString()}`);
  await processReminders(); // chạy trực tiếp trong main process, có access socket
});
