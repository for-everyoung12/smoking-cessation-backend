const ProgressTracking = require('../models/progressTracking.model');
const SmokingStatus = require('../models/smokingStatus.model')
exports.recordProgress = async (req, res) => {
  try {
    const { cigarette_count, note } = req.body;

    // 🕒 Thời điểm hiện tại theo giờ Việt Nam
    const now = new Date();
    const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);

    // 🔍 Tạo 2 biến tạm để so sánh trùng ngày
    const startOfDay = new Date(vnNow);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    // ✅ Kiểm tra xem đã ghi hôm nay chưa
    const existing = await ProgressTracking.findOne({
      user_id: req.user.id,
      plan_id: req.params.planId,
      stage_id: req.params.stageId,
      date: { $gte: startOfDay, $lt: endOfDay }
    });

    if (existing) {
      return res.status(409).json({
        message: 'You have already recorded your progress for today.'
      });
    }

    // 💰 Tính money_spent từ pre-plan
    const preStatus = await SmokingStatus.findOne({
      user_id: req.user.id,
      plan_id: null
    }).sort({ createdAt: -1 });

    const pricePerPack = preStatus?.price_per_pack || 25000;
    const moneyPerCig = pricePerPack / 20;
    const moneySpent = cigarette_count * moneyPerCig;

    // ✅ Lưu đúng thời điểm thực tế người dùng bấm (vnNow)
    const progress = await ProgressTracking.create({
      user_id: req.user.id,
      plan_id: req.params.planId,
      stage_id: req.params.stageId,
      date: vnNow, // ❗ Đây là điểm quan trọng
      cigarette_count,
      note,
      money_spent: moneySpent
    });

    res.status(201).json({
      message: 'Progress recorded',
      progress
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
