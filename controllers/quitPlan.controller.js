const QuitPlan = require('../models/quitPlan.model');
const UserMembership = require('../models/userMembership.model');
const QuitStage = require('../models/quitStage.model');
const ProgressTracking = require('../models/progressTracking.model');
const SmokingStatus = require('../models/smokingStatus.model');
// Helper function to create default quit stages
function generateSuggestedStages(status) {
  const { cigarette_count = 0, suction_frequency = "medium" } = status;
  const stages = [];

  if (cigarette_count <= 5 && suction_frequency === "light") {
    stages.push({
      name: 'Reduce smoking',
      description:
        'Next 7 days:\n' +
        '- Cut down by 1–2 cigarettes per day\n' +
        '- Avoid unnecessary smoking times\n' +
        '- Replace smoking with drinking water, walking, or chewing gum',
      status: 'not_started'
    });
    stages.push({
      name: 'Complete cessation',
      description:
        'Goal: Completely stop smoking this week\n' +
        '- Do not smoke any cigarette at all\n' +
        '- Handle cravings by deep breathing, journaling\n' +
        '- Avoid environments that trigger smoking memories',
      status: 'not_started'
    });
  } else if (cigarette_count <= 15 || suction_frequency === "medium") {
    stages.push({
      name: 'Cut down',
      description:
        'This week:\n' +
        '- Reduce your current intake by half (e.g., from 10 → 5 cigarettes)\n' +
        '- Avoid smoking after meals or in the morning\n' +
        '- Keep a log of when you smoke to identify habits',
      status: 'not_started'
    });
    stages.push({
      name: 'Quit smoking',
      description:
        'Start smoke-free phase:\n' +
        '- Remove all cigarettes and lighters from your surroundings\n' +
        '- Join activities that distract you (e.g., light exercise, meditation)\n' +
        '- Write a journal to reflect on your feelings',
      status: 'not_started'
    });
    stages.push({
      name: 'Maintain',
      description:
        'Maintain smoke-free lifestyle:\n' +
        '- Recognize and manage relapse triggers\n' +
        '- Reinforce positive results (better sleep, breath, finances)\n' +
        '- Reward yourself for progress',
      status: 'not_started'
    });
  } else {
    stages.push({
      name: 'Step 1: Reduce',
      description:
        'Cut down to 70% of current intake:\n' +
        '- E.g., from 20 → 14 cigarettes/day\n' +
        '- Avoid smoking out of habit\n' +
        '- Skip smoking after meals or during idle time',
      status: 'not_started'
    });
    stages.push({
      name: 'Step 2: Further Reduce',
      description:
        'Cut down to 30% of original amount:\n' +
        '- E.g., from 14 → 5 cigarettes/day\n' +
        '- Set specific rules: "no smoking at home", "no smoking after 6PM"\n' +
        '- Track your feelings to monitor progress',
      status: 'not_started'
    });
    stages.push({
      name: 'Step 3: Quit',
      description:
        'Begin full cessation:\n' +
        '- Replace smoking rituals with positive activities\n' +
        '- Keep a health journal\n' +
        '- Consider joining a support group if needed',
      status: 'not_started'
    });
    stages.push({
      name: 'Step 4: Sustain',
      description:
        'Stay smoke-free:\n' +
        '- Avoid triggers like stress or parties\n' +
        '- Give yourself small weekly rewards\n' +
        '- Reflect on long-term health improvements',
      status: 'not_started'
    });
  }

  return stages;
}



async function createSuggestedStages(planId, startDate, userId) {
  const latestStatus = await SmokingStatus.findOne({
    user_id: userId,
    plan_id: null
  }).sort({ createdAt: -1 });

  const fallback = [
    {
      name: 'Reduce cigarette intake',
      description: 'Gradually reduce number of cigarettes per day',
      status: 'not_started'
    },
    {
      name: 'Complete cessation',
      description: 'Stop smoking completely',
      status: 'not_started'
    },
    {
      name: 'Maintain non-smoking',
      description: 'Maintain smoke-free status',
      status: 'not_started'
    }
  ];

  const stages = latestStatus ? generateSuggestedStages(latestStatus) : fallback;

  // ✅ Dùng startDate đã là Date object hoặc ISO string
  const start = new Date(startDate);
  if (isNaN(start.getTime())) {
    throw new Error('Invalid start date for stage generation');
  }

  const now = new Date();
  const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);

  return Promise.all(
    stages.map((stage, index) => {
      const stageStart = new Date(start);
      stageStart.setDate(stageStart.getDate() + index * 7);
      stageStart.setHours(vnNow.getHours(), vnNow.getMinutes(), vnNow.getSeconds());

      const stageEnd = new Date(stageStart);
      stageEnd.setDate(stageEnd.getDate() + 6);
      stageEnd.setHours(vnNow.getHours(), vnNow.getMinutes(), vnNow.getSeconds());

      return QuitStage.create({
        plan_id: planId,
        name: stage.name,
        description: stage.description,
        status: stage.status,
        start_date: stageStart,
        end_date: stageEnd
      });
    })
  );
}



// Main controller
exports.createQuitPlan = async (req, res) => {
  try {
    const { coach_user_id, goal, start_date, note } = req.body;

    const membership = await UserMembership.findOne({
      user_id: req.user.id,
      status: 'active'
    }).populate('package_id');

    if (!membership || !membership.package_id?.can_use_quitplan) {
      return res.status(403).json({ message: 'Your membership plan does not allow creating a quit plan.' });
    }

    const allowCoach = membership.package_id?.can_assign_coach;
    if (coach_user_id && !allowCoach) {
      return res.status(403).json({ message: 'Your membership plan does not allow assigning a coach.' });
    }

    const existingPlan = await QuitPlan.findOne({
      user_id: req.user.id,
      status: { $in: ['ongoing', 'pending'] }
    });

    if (existingPlan) {
      return res.status(409).json({ message: 'You already have an active quit plan.' });
    }

    // ✅ Dùng lại start_date do FE đã gửi đúng ISO format
    const selectedDate = new Date(start_date);
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid start_date format.' });
    }

    // ✅ Thêm giờ hiện tại theo GMT+7 (nếu bạn muốn có timestamp chính xác)
    const now = new Date();
    const vnNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    selectedDate.setHours(vnNow.getHours(), vnNow.getMinutes(), vnNow.getSeconds());

    const newPlan = await QuitPlan.create({
      user_id: req.user.id,
      coach_user_id: allowCoach ? coach_user_id : null,
      goal,
      start_date: selectedDate,
      status: 'ongoing',
      note
    });

    const createdStages = await createSuggestedStages(newPlan._id, selectedDate.toISOString(), req.user.id);

    return res.status(201).json({
      message: 'Quit plan created successfully.',
      plan: newPlan,
      stages: createdStages
    });

  } catch (error) {
    console.error('[createQuitPlan]', error);
    return res.status(500).json({ message: 'Failed to create quit plan.' });
  }
};





exports.getUserQuitPlans = async (req, res) => {
  try {
    const plans = await QuitPlan.find({ user_id: req.params.id });
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(plans);
  } catch (error) {
    console.error('[getUserQuitPlans]', error);
    res.status(500).json({ message: 'Failed to fetch plans' });
  }
};

exports.getQuitPlanById = async (req, res) => {
  try {
    const plan = await QuitPlan.findById(req.params.planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json(plan);
  } catch (error) {
    console.error('[getQuitPlanById]', error);
    res.status(500).json({ message: 'Failed to get plan' });
  }
};

exports.updateQuitPlanStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['ongoing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const plan = await QuitPlan.findByIdAndUpdate(
      req.params.planId,
      { status },
      { new: true }
    );
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.json({ message: 'Status updated', plan });
  } catch (error) {
    console.error('[updateQuitPlanStatus]', error);
    res.status(500).json({ message: 'Failed to update status' });
  }
};

exports.getQuitPlanSummary = async (req, res) => {
  try {
    const planId = req.params.planId;

    // 1. Lấy kế hoạch
    const plan = await QuitPlan.findById(planId);
    if (!plan || plan.user_id.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Quit plan not found or access denied' });
    }

    // 2. Lấy danh sách stage
    const stages = await QuitStage.find({ plan_id: planId });

    const totalStages = stages.length;
    const completedStages = stages.filter(s => s.status === 'completed').length;

    // 3. Lấy progress
    const progressRecords = await ProgressTracking.find({ plan_id: planId, user_id: req.user.id });

    const totalCigarettes = progressRecords.reduce(
      (sum, r) => sum + (r.cigarette_count || 0),
      0
    );

    const totalMoneySpent = progressRecords.reduce(
      (sum, r) => sum + (r.money_spent || 0),
      0
    );

    const latestProgressDate = progressRecords.length
      ? new Date(Math.max(...progressRecords.map(r => new Date(r.date))))
      : null;

    // 4. Tính tổng số ngày của tất cả các stage
    const allStageDays = stages.reduce((sum, s) => {
      const start = new Date(s.start_date);
      const end = new Date(s.end_date);
      const duration = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return sum + duration;
    }, 0);

    const completionRate =
      allStageDays > 0
        ? Math.round((progressRecords.length / allStageDays) * 100)
        : 0;

    res.json({
      plan_id: plan._id,
      goal: plan.goal,
      start_date: plan.start_date,
      status: plan.status,
      total_stages: totalStages,
      completed_stages: completedStages,
      progress_days: progressRecords.length,
      total_cigarettes: totalCigarettes,
      total_money_spent: totalMoneySpent,
      latest_progress_date: latestProgressDate,
      completion_rate: completionRate
    });
  } catch (error) {
    console.error('[getQuitPlanSummary]', error);
    res.status(500).json({ message: 'Failed to generate summary' });
  }
};

exports.getSuggestedStages = async (req, res) => {
  try {
    const latestStatus = await SmokingStatus.findOne({
      user_id: req.user.id,
      plan_id: null
    }).sort({ createdAt: -1 });

    if (!latestStatus) {
      return res.status(404).json({ message: "No smoking status found" });
    }

    const stages = generateSuggestedStages(latestStatus);
    res.json({ suggested_stages: stages });
  } catch (error) {
    console.error("[getSuggestedStages]", error);
    res.status(500).json({ message: "Failed to generate stage suggestions" });
  }
};