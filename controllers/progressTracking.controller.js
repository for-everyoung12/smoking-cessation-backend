const ProgressTracking = require('../models/progressTracking.model');

exports.recordProgress = async (req, res) => {
  try {
    const { cigarette_count, note, date } = req.body;
    const progress = await ProgressTracking.create({
      user_id: req.user.id,
      plan_id: req.params.planId,
      stage_id: req.params.stageId,
      date: date || new Date(),
      cigarette_count,
      note
    });
    res.status(201).json({ message: 'Progress recorded', progress });
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
