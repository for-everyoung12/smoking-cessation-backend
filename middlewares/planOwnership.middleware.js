const QuitPlan = require('../models/quitPlan.model');

async function verifyPlanOwnership(req, res, next) {
  try {
    const plan = await QuitPlan.findById(req.params.planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    if (plan.user_id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: Not plan owner' });
    }
    next();
  } catch (error) {
    console.error('[verifyPlanOwnership]', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = { verifyPlanOwnership };
