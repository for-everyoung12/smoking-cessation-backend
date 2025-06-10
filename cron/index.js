// cron/index.js
const cron = require('node-cron');
const { exec } = require('child_process');

console.log('Scheduler đang chạy...');

cron.schedule('0 * * * *', () => { // mỗi giờ chạy 1 lần
  console.log(`Chạy job hết hạn membership lúc ${new Date().toLocaleString()}`);

  exec('node cron/expireMemberships.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Lỗi khi chạy expireMemberships: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    if (stdout) {
      console.log(`stdout: ${stdout}`);
    }
  });
});
