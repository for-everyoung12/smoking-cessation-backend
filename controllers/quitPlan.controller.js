const QuitPlan = require('../models/quitPlan.model');
const UserMembership = require('../models/userMembership.model');
const QuitStage = require('../models/quitStage.model');
const ProgressTracking = require('../models/progressTracking.model');
const SmokingStatus = require('../models/smokingStatus.model');
const { sendNotification } = require('../utils/notify');
const User = require('../models/user.model');
const CoachUser = require("../models/coachUser.model");
const QuitGoalDraft = require('../models/quitGoalDraft.model');

function getStageDurations(cigarette_count, totalStages) {
  let totalDuration;

  if (cigarette_count <= 5) {
    totalDuration = 14; // 2 stages, 7 days each
  } else if (cigarette_count <= 15) {
    totalDuration = Math.min(60, 30 + (cigarette_count - 5) * 2); // 30–50 days
  } else {
    totalDuration = Math.min(90, cigarette_count * 3);
  }

  const ratioByStageCount = {
    2: [1, 1],             // cut down, quit
    3: [2, 2, 3],          // cut down, quit, maintain
    4: [2, 2, 2, 3],       // cut down, cut more, quit, maintain
  };

  const ratios = ratioByStageCount[totalStages] || Array(totalStages).fill(1);
  const totalRatio = ratios.reduce((a, b) => a + b, 0);

  let rawDurations = ratios.map(ratio => Math.floor((totalDuration * ratio) / totalRatio));
  let allocated = rawDurations.reduce((a, b) => a + b, 0);
  let remainder = totalDuration - allocated;

  // Phân bổ phần dư (nếu có) cho các stage đầu
  for (let i = 0; i < remainder; i++) {
    rawDurations[i % totalStages]++;
  }

  return rawDurations;
}


function generateSuggestedStages(status) {
  const { cigarette_count = 0, suction_frequency = "medium" } = status;
  const stages = [];

  if (cigarette_count <= 5 && suction_frequency === "light") {
    stages.push({
      name: 'Reduce smoking',
      description:
        'Reduce 1–2 cigarettes per day:\n' +
        '- Avoid smoking after meals or when stressed\n' +
        '- Replace smoking with drinking water, chewing gum, or walking\n' +
        '- Track the moments you feel the urge to smoke to increase awareness',
      status: 'not_started',
      max_daily_cigarette: cigarette_count - 1
    });
    stages.push({
      name: 'Complete cessation',
      description:
        'Quit completely:\n' +
        '- Avoid all cigarettes\n' +
        '- Remove cigarettes, lighters, and ashtrays from your environment\n' +
        '- Journal your emotions when cravings hit\n' +
        '- Practice meditation or deep breathing to stay calm',
      status: 'not_started',
      max_daily_cigarette: 0
    });
  } else if (cigarette_count <= 15 || suction_frequency === "medium") {
    stages.push({
      name: 'Cut down',
      description:
        'Cut your intake by half:\n' +
        '- Example: from 10 → 5 cigarettes/day\n' +
        '- Avoid morning smokes or smoking while waiting\n' +
        '- Log your smoking time and reasons to understand your habits\n' +
        '- Apply the 5-minute delay rule before lighting a cigarette',
      status: 'not_started',
      max_daily_cigarette: Math.ceil(cigarette_count / 2)
    });
    stages.push({
      name: 'Quit smoking',
      description:
        'Start smoke-free phase:\n' +
        '- Don’t smoke at all\n' +
        '- Reward yourself for each smoke-free day\n' +
        '- Use an app or tracker board to mark your progress\n' +
        '- Talk to family or friends for emotional support',
      status: 'not_started',
      max_daily_cigarette: 2
    });
    stages.push({
      name: 'Maintain',
      description:
        'Maintain a smoke-free lifestyle:\n' +
        '- Avoid environments where others smoke (bars, parties)\n' +
        '- Build new habits: exercise, reading, music\n' +
        '- Recognize the benefits: better sleep, easier breathing, more savings\n' +
        '- Remind yourself of your reasons to quit',
      status: 'not_started',
      max_daily_cigarette: 0
    });
  } else {
    stages.push({
      name: 'Step 1: Reduce',
      description:
        'Cut down to 70% of current intake:\n' +
        '- Example: from 20 → 14 cigarettes/day\n' +
        '- Avoid smoking out of habit — smoke only with intention\n' +
        '- Identify essential smoking moments\n' +
        '- Write down your reasons for quitting',
      status: 'not_started',
      max_daily_cigarette: Math.round(cigarette_count * 0.7)
    });
    stages.push({
      name: 'Step 2: Further Reduce',
      description:
        'Reduce further to 30% of your original amount:\n' +
        '- Example: from 14 → 5 cigarettes/day\n' +
        '- Set personal rules: no smoking indoors or after 6PM\n' +
        '- Keep a journal of your cravings and emotions\n' +
        '- Use light exercise or 5-minute meditation as replacement',
      status: 'not_started',
      max_daily_cigarette: Math.round(cigarette_count * 0.3)
    });
    stages.push({
      name: 'Step 3: Quit',
      description:
        'Start complete cessation:\n' +
        '- Discard all smoking-related items\n' +
        '- Structure your day to avoid idle time\n' +
        '- Share your progress with loved ones for encouragement\n' +
        '- Document your milestones and achievements',
      status: 'not_started',
      max_daily_cigarette: 1
    });
    stages.push({
      name: 'Step 4: Sustain',
      description:
        'Stay smoke-free:\n' +
        '- Avoid triggers: alcohol, social groups that smoke\n' +
        '- Treat yourself weekly for staying smoke-free\n' +
        '- Continue journaling or using tracking apps\n' +
        '- Focus on long-term benefits: health, finances, family',
      status: 'not_started',
      max_daily_cigarette: 0
    });
  }

  return stages;
}

async function createSuggestedStages(planId, startDate, userId, customMaxValues = []) {
  const latestStatus = await SmokingStatus.findOne({ user_id: userId, plan_id: null }).sort({ createdAt: -1 });
  const fallback = [
    { name: 'Reduce intake', description: 'Gradually reduce', status: 'not_started', max_daily_cigarette: null },
    { name: 'Stop smoking', description: 'Full cessation', status: 'not_started', max_daily_cigarette: 0 },
    { name: 'Maintain', description: 'Maintain non-smoking', status: 'not_started', max_daily_cigarette: 0 }
  ];

  const stages = latestStatus ? generateSuggestedStages(latestStatus) : fallback;
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const durations = getStageDurations(latestStatus?.cigarette_count || 0, stages.length);

  let currentDate = new Date(start);
 return Promise.all(
    stages.map((stage, index) => {
      const stageStart = new Date(currentDate);
      const stageEnd = new Date(stageStart);
      stageEnd.setDate(stageEnd.getDate() + durations[index] - 1);
      currentDate = new Date(stageEnd);
      currentDate.setDate(currentDate.getDate() + 1);

      const customMax = customMaxValues[index];
      return QuitStage.create({
        plan_id: planId,
        name: stage.name,
        description: stage.description,
        status: stage.status,
        start_date: stageStart,
        end_date: stageEnd,
        max_daily_cigarette: customMax !== undefined ? Number(customMax) : stage.max_daily_cigarette
      });
    })
  );
}


exports.createQuitPlan = async (req, res) => {
  try {
    const { start_date, note, reasons, reasons_detail, coach_user_id, custom_max_values = [] } = req.body;



   const draft = await QuitGoalDraft.findOne({ user_id: req.user.id });
    if (!draft || !draft.goal?.trim()) {
      return res.status(400).json({ message: 'Goal is missing or empty.' });
    }
    const goal = draft.goal;


    const membership = await UserMembership.findOne({
      user_id: req.user.id,
      status: 'active'
    }).populate('package_id');

    if (!membership || !membership.package_id?.can_use_quitplan) {
      return res.status(403).json({ message: 'Your membership does not allow quit plan creation.' });
    }

    const allowCoach = membership.package_id?.can_assign_coach;

    if (coach_user_id && !allowCoach) {
      return res.status(403).json({ message: 'Your membership does not allow coach assignment.' });
    }

    const existingPlan = await QuitPlan.findOne({
      user_id: req.user.id,
      status: { $in: ['ongoing', 'pending'] }
    });

    if (existingPlan) {
      return res.status(409).json({ message: 'You already have an active quit plan.' });
    }

    const selectedDate = new Date(start_date);
    if (isNaN(selectedDate.getTime())) {
      return res.status(400).json({ message: 'Invalid start_date format.' });
    }
    selectedDate.setHours(0, 0, 0, 0);


    const newPlan = await QuitPlan.create({
      user_id: req.user.id,
      coach_user_id: allowCoach ? coach_user_id : null,
      goal,
      start_date: selectedDate,
      status: 'ongoing',
      note,
      reasons: reasons || [],
      reasons_detail: reasons_detail || ''
    });


    if (allowCoach && coach_user_id) {
  const coach = await User.findById(coach_user_id);
  if (!coach || coach.role !== 'coach') {
    return res.status(404).json({ message: 'Invalid coach selected' });
  }

  const exists = await CoachUser.findOne({
    coach_id: coach_user_id,
    user_id: req.user.id,
  });

  const assignedCount = await CoachUser.countDocuments({ coach_id: coach_user_id });

  if (!exists && assignedCount >= coach.max_users) {
    return res.status(400).json({ message: 'Coach has reached maximum number of users' });
  }

  if (!exists) {
    await CoachUser.create({
      coach_id: coach_user_id,
      user_id: req.user.id,
      status: 'active',
      created_at: new Date()
    });

    // Optional — nếu bạn vẫn dùng current_users
    // coach.current_users += 1;
    // await coach.save();
  }
}



    const createdStages = await createSuggestedStages(newPlan._id, selectedDate, req.user.id, custom_max_values);



    await sendNotification(
      req.user.id,
      "Quit plan created",
      `You have created a plan "${goal}" starting from ${selectedDate.toLocaleDateString('vi-VN')}`,
      "quitplan"
    );


    await QuitGoalDraft.deleteOne({ user_id: req.user.id });

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

    // 🔧 Simulate stage timing
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const durations = getStageDurations(latestStatus.cigarette_count || 0, stages.length);

    let current = new Date(today);

    const enrichedStages = stages.map((stage, index) => {
      const start_date = new Date(current);
      const end_date = new Date(start_date);
      end_date.setDate(start_date.getDate() + durations[index] - 1);

      current = new Date(end_date);
      current.setDate(current.getDate() + 1);

      return {
        ...stage,
        start_date,
        end_date
      };
    });

    res.json({ suggested_stages: enrichedStages });
  } catch (error) {
    console.error("[getSuggestedStages]", error);
    res.status(500).json({ message: "Failed to generate stage suggestions" });
  }
};

exports.getAllQuitPlans = async (req, res) => {
  try {
    const plans = await QuitPlan.find().populate('user_id', 'full_name email').populate('coach_user_id', 'full_name email');
    res.json(plans);
  } catch (error) {
    console.error('[getAllQuitPlans]', error);
    res.status(500).json({ message: 'Failed to fetch all quit plans' });
  }
};