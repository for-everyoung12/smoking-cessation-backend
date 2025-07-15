const ProgressTracking = require('../models/progressTracking.model');
const SmokingStatus = require('../models/smokingStatus.model');
const QuitStage = require('../models/quitStage.model');
const QuitPlan = require('../models/quitPlan.model');
const { checkAndGrantBadges } = require('../utils/badgeHelper');

exports.recordProgress = async (req, res) => {
  try {
    const { cigarette_count, note } = req.body;

    // 🕘 Lấy giờ hiện tại (UTC) và chuyển sang giờ VN (UTC+7)
    const now = new Date();
    const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
    const vnNow = new Date(now.getTime() + VN_OFFSET_MS);

    // 🗓️ Xác định thời điểm bắt đầu và kết thúc ngày (theo giờ VN)
    const startOfVNDay = new Date(vnNow);
    startOfVNDay.setHours(0, 0, 0, 0);
    const endOfVNDay = new Date(startOfVNDay.getTime() + 24 * 60 * 60 * 1000);

    // 🔁 Chuyển start/end VN day về UTC để so sánh trong MongoDB
    const utcStart = new Date(startOfVNDay.getTime() - VN_OFFSET_MS);
    const utcEnd = new Date(endOfVNDay.getTime() - VN_OFFSET_MS);

    console.log('🔍 Checking from:', utcStart.toISOString(), 'to', utcEnd.toISOString());

    // 📌 Kiểm tra đã ghi chưa trong ngày hôm nay (giờ VN)
    const existing = await ProgressTracking.findOne({
      user_id: req.user.id,
      plan_id: req.params.planId,
      stage_id: req.params.stageId,
      date: { $gte: utcStart, $lt: utcEnd }
    });

    if (existing) {
      return res.status(409).json({
        message: 'You have already recorded your progress for today.'
      });
    }

    // 📊 Tính số tiền đã tiêu
    const preStatus = await SmokingStatus.findOne({
      user_id: req.user.id,
      plan_id: null
    }).sort({ createdAt: -1 });

    const pricePerPack = preStatus?.price_per_pack || 25000;
    const moneyPerCig = pricePerPack / 20;
    const moneySpent = cigarette_count * moneyPerCig;

    // ✅ Lưu tiến trình
    const progress = await ProgressTracking.create({
      user_id: req.user.id,
      plan_id: req.params.planId,
      stage_id: req.params.stageId,
      date: now, // ⏱️ lưu theo UTC
      cigarette_count,
      note,
      money_spent: moneySpent
    });

    // ✅ Cập nhật trạng thái stage
    const stage = await QuitStage.findById(req.params.stageId);
    if (stage.status === 'not_started') {
      stage.status = 'in_progress';
      await stage.save();
    }

    const totalStageDays = Math.floor((new Date(stage.end_date) - new Date(stage.start_date)) / (1000 * 60 * 60 * 24)) + 1;
    const stageProgressCount = await ProgressTracking.countDocuments({
      user_id: req.user.id,
      plan_id: req.params.planId,
      stage_id: req.params.stageId
    });

    if (stage.status !== 'completed' && stageProgressCount >= totalStageDays) {
      stage.status = 'completed';
      await stage.save();
    }

    // ✅ Nếu tất cả stage đã completed thì cập nhật trạng thái plan
    const allStages = await QuitStage.find({ plan_id: req.params.planId });
    const allCompleted = allStages.every(s => s.status === 'completed');
    if (allCompleted) {
      await QuitPlan.findByIdAndUpdate(req.params.planId, { status: 'completed' });
    }

    // 🏅 Gắn huy hiệu nếu đủ điều kiện
    const grantedBadges = await checkAndGrantBadges(req.user.id, req.params.planId);

    res.status(201).json({
      message: 'Progress recorded',
      progress,
      granted_badges: grantedBadges
    });

  } catch (error) {
    console.error('[recordProgress]', error);
    res.status(500).json({ message: 'Failed to record progress' });
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
