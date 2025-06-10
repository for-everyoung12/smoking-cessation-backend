const QuitPlan = require('../models/quitPlan.model');
const UserMembership = require('../models/userMembership.model');
const QuitStage = require('../models/quitStage.model');


exports.createQuitPlan = async (req, res) => {
  try {
    const { coach_user_id, goal, start_date, note } = req.body;

    const membership = await UserMembership.findOne({ user_id: req.user.id, status: 'active' }).populate('package_id');
    if (!membership || !membership.package_id?.can_use_quitplan) {
      return res.status(403).json({ message: 'Your membership does not allow creating quit plans.' });
    }

    const allowCoach = membership.package_id?.can_assign_coach;
    if (coach_user_id && !allowCoach) {
      return res.status(403).json({ message: 'Your membership does not allow assigning a coach.' });
    }

    // Tạo kế hoạch mới
    const newPlan = await QuitPlan.create({
      user_id: req.user.id,
      coach_user_id: allowCoach ? coach_user_id : null,
      goal,
      start_date,
      status: 'ongoing',
      note
    });

    // Tạo giai đoạn mặc định cho kế hoạch mới
    const defaultStages = [
      { name: 'Giảm số điếu thuốc', description: 'Giảm dần số điếu trong ngày', status: 'not_started' },
      { name: 'Cai thuốc hoàn toàn', description: 'Không hút thuốc hoàn toàn', status: 'not_started' },
      { name: 'Duy trì không hút thuốc', description: 'Duy trì trạng thái cai', status: 'not_started' },
    ];

    const createdStages = await Promise.all(defaultStages.map(stage => {
      return QuitStage.create({
        plan_id: newPlan._id,
        name: stage.name,
        description: stage.description,
        status: stage.status,
      });
    }));

    res.status(201).json({ message: 'Quit plan created', plan: newPlan, stages: createdStages });

  } catch (error) {
    console.error('[createQuitPlan]', error);
    res.status(500).json({ message: 'Failed to create quit plan' });
  }
};


exports.getUserQuitPlans = async (req, res) => {
  try {
    const plans = await QuitPlan.find({ user_id: req.params.id });
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
