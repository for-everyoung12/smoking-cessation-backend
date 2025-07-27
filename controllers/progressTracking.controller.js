const ProgressTracking = require('../models/progressTracking.model');
const SmokingStatus = require('../models/smokingStatus.model');
const QuitStage = require('../models/quitStage.model');
const QuitPlan = require('../models/quitPlan.model');
const { checkAndGrantBadges } = require('../utils/badgeHelper');

exports.recordProgress = async (req, res) => {
  try {
    const { cigarette_count, note } = req.body;
    const now = new Date();

    const getVNStartEndUTC = () => {
      const vnNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
      vnNow.setHours(0, 0, 0, 0);

      const vnStart = new Date(vnNow);
      const vnEnd = new Date(vnStart.getTime() + 24 * 60 * 60 * 1000);

      return {
        utcStart: new Date(vnStart.toISOString()),
        utcEnd: new Date(vnEnd.toISOString())
      };
    };

    const { utcStart, utcEnd } = getVNStartEndUTC();

    const existing = await ProgressTracking.findOne({
      user_id: req.user.id,
      plan_id: req.params.planId,
      stage_id: req.params.stageId,
      date: { $gte: utcStart, $lt: utcEnd },
    });

    if (existing) {
      return res.status(409).json({
        message: "You have already recorded your progress for today.",
      });
    }

    const preStatus = await SmokingStatus.findOne({
      user_id: req.user.id,
      plan_id: null,
    }).sort({ createdAt: -1 });

    const pricePerPack = preStatus?.price_per_pack || 25000;
    const moneyPerCig = pricePerPack / 20;
    const moneySpent = cigarette_count * moneyPerCig;

    const progress = await ProgressTracking.create({
      user_id: req.user.id,
      plan_id: req.params.planId,
      stage_id: req.params.stageId,
      date: now,
      cigarette_count,
      note,
      money_spent: moneySpent,
    });

    const stage = await QuitStage.findById(req.params.stageId);

    // ✅ NEW: check cigarette limit
    if (stage.max_daily_cigarette !== null && cigarette_count > stage.max_daily_cigarette) {
      const overLimitCount = await ProgressTracking.countDocuments({
        user_id: req.user.id,
        plan_id: req.params.planId,
        stage_id: req.params.stageId,
        cigarette_count: { $gt: stage.max_daily_cigarette }
      });

      if (overLimitCount >= 3) {
        stage.status = 'failed';
        await stage.save();
        await QuitPlan.findByIdAndUpdate(req.params.planId, { status: 'cancelled' });

        const updatedStage = await QuitStage.findById(req.params.stageId);

        return res.status(200).json({
          message: `You exceeded the cigarette limit (max ${stage.max_daily_cigarette}) 3 or more times. Stage failed and quit plan cancelled. Please create a new plan.`,
          cancelled: true,
          updatedStage,
        });
      } else {
        return res.status(200).json({
          message: `You exceeded today's cigarette limit of ${stage.max_daily_cigarette}. Continued violations may cancel your plan.`,
          warning: true,
          progress
        });
      }
    }

    if (stage.status === "not_started") {
      stage.status = "in_progress";
      await stage.save();
    }

    const totalStageDays = Math.floor((new Date(stage.end_date) - new Date(stage.start_date)) / (1000 * 60 * 60 * 24)) + 1;

    const stageProgressCount = await ProgressTracking.countDocuments({
      user_id: req.user.id,
      plan_id: req.params.planId,
      stage_id: req.params.stageId,
    });

    if (stage.status !== "completed" && stageProgressCount >= totalStageDays) {
      stage.status = "completed";
      await stage.save();
    }

    const allStages = await QuitStage.find({ plan_id: req.params.planId });
    const allCompleted = allStages.every((s) => s.status === "completed");
    if (allCompleted) {
      await QuitPlan.findByIdAndUpdate(req.params.planId, { status: "completed" });
    }

    
    const grantedBadges = await checkAndGrantBadges(req.user.id, req.params.planId);

    const updatedStage = await QuitStage.findById(req.params.stageId); // always get latest version

    res.status(201).json({
      message: "Progress recorded",
      progress,
      updatedStage,
      granted_badges: grantedBadges,
    });

  } catch (error) {
    console.error("[recordProgress]", error);
    res.status(500).json({ message: "Failed to record progress" });
  }
};




exports.getProgressByStage = async (req, res) => {
  try {
    const progresses = await ProgressTracking.find({
      plan_id: req.params.planId,
      stage_id: req.params.stageId,
      user_id: req.user.id
    });
    res.json(progresses);
  } catch (error) {
    console.error('[getProgressByStage]', error);
    res.status(500).json({ message: 'Failed to fetch progress records' });
  }
};
