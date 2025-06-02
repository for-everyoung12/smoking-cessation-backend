const QuitStage = require('../models/quitStage.model');

exports.getStagesByPlan = async (req, res) => {
  try {
    const stages = await QuitStage.find({ plan_id: req.params.planId });
    res.json(stages);
  } catch (error) {
    console.error('[getStagesByPlan]', error);
    res.status(500).json({ message: 'Failed to fetch stages' });
  }
};