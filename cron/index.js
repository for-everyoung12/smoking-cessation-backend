const cron = require("node-cron");
const processReminders = require("./processReminders");
const { exec } = require("child_process");

cron.schedule("0 * * * *", () => {
  console.log(` Expire memberships @ ${new Date().toLocaleString()}`);
  exec("node cron/expireMemberships.js", (error, stdout, stderr) => {
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    if (error) console.error(" expireMemberships error:", error.message);
  });
});

//  Reminder: mỗi phút (CHUYỂN sang gọi trực tiếp)
cron.schedule("* * * * *", async () => {
  await processReminders();
});

cron.schedule("0 2 * * *", () => {
  console.log(` Skipping expired stages @ ${new Date().toLocaleString()}`);
  exec("node cron/markSkippedStages.js", (error, stdout, stderr) => {
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    if (error) console.error("markSkippedStages error:", error.message);
  });
});