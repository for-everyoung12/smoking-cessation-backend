const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const QuitStage = require("../models/quitStage.model");
const ProgressTracking = require("../models/progressTracking.model");

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function markSkippedStages() {
  const now = new Date();
  const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const today = new Date(vnNow);
  today.setHours(0, 0, 0, 0);
const utcToday = new Date(startOfVNDay.getTime() - 7 * 60 * 60 * 1000);
  const stages = await QuitStage.find({
  end_date: { $lt: utcToday },
    status: { $in: ['not_started', 'in_progress'] }
  });

  let skippedCount = 0;

  for (const stage of stages) {
    const hasProgress = await ProgressTracking.exists({
      plan_id: stage.plan_id,
      stage_id: stage._id,
      date: { $gte: stage.start_date, $lte: stage.end_date }
    });

    if (!hasProgress) {
      stage.status = 'skipped';
      await stage.save();
      skippedCount++;
      console.log(` Skipped stage: ${stage.name} (plan ${stage.plan_id})`);
    }
  }

  console.log(` Done. Total skipped stages: ${skippedCount}`);
  mongoose.disconnect();
}

markSkippedStages().catch(err => {
  console.error("Error in markSkippedStages:", err);
  mongoose.disconnect();
});
