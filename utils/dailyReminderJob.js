const cron = require('node-cron');
const User = require('../models/user.model');
const QuitPlan = require('../models/quitPlan.model');
const QuitStage = require('../models/quitStage.model');
const ProgressTracking = require('../models/progressTracking.model');
const { sendNotification } = require('./notify');
const sendEmail = require('./sendmail');

function getVNStartEndUTC() {
  const vnNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
  vnNow.setHours(0, 0, 0, 0);
  const vnStart = new Date(vnNow);
  const vnEnd = new Date(vnStart.getTime() + 24 * 60 * 60 * 1000);
  return {
    utcStart: new Date(vnStart.toISOString()),
    utcEnd: new Date(vnEnd.toISOString())
  };
}


cron.schedule('0 23 * * *', async () => {
  console.log(' [DailyReminder] Checking members without progress...', new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }));

  const { utcStart, utcEnd } = getVNStartEndUTC();

  try {
  
    const activePlans = await QuitPlan.find({ status: 'ongoing' });

    for (const plan of activePlans) {
      const userId = plan.user_id;

  
      const stage = await QuitStage.findOne({
        plan_id: plan._id,
        start_date: { $lte: new Date() },
        end_date: { $gte: new Date() }
      });

      if (!stage) continue;

     
      const existing = await ProgressTracking.findOne({
        user_id: userId,
        plan_id: plan._id,
        stage_id: stage._id,
        date: { $gte: utcStart, $lt: utcEnd }
      });

      if (!existing) {
        const message = "You haven't recorded your cigarette count for today yet. Don’t forget to log your progress so we can track your journey accurately!";

       
        await sendNotification(userId, 'Reminder to log progress', message);

 
        const user = await User.findById(userId);
        if (user?.email) {
          await sendEmail(
            user.email,
            'Did you record your smoking progress today?',
            `<p>${message}</p>
            <p>Log in to your app now and don’t miss a single day of tracking. You're doing great!</p>`
          );
        }
      }
    }

    console.log(`[DailyReminder] Done checking ${activePlans.length} plans`);
  } catch (err) {
    console.error('[DailyReminder] Error:', err);
  }
}, {
  timezone: 'Asia/Ho_Chi_Minh'
});
