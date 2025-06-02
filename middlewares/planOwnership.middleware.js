const QuitPlan = require('../models/quitPlan.model');

exports.verifyPlanOwnership = async (req, res, next) => {
  const plan = await QuitPlan.findById(req.params.planId);
  if (!plan || plan.user_id.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Access denied to this plan' });
  }
  next();
};
