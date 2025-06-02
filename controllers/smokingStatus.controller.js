const SmokingStatus = require('../models/smokingStatus.model');

exports.recordSmokingStatus = async (req, res) => {
  try {
    const { cigarette_count, time_of_smoking, money_spent, health_note, record_date } = req.body;
    const status = await SmokingStatus.create({
      user_id: req.user.id,
      plan_id: req.params.planId,
      stage_id: req.params.stageId,
      record_date: record_date || new Date(),
      cigarette_count,
      time_of_smoking,
      money_spent,
      health_note
    });
    res.status(201).json({ message: 'Smoking status recorded', status });
  } catch (error) {
    console.error('[recordSmokingStatus]', error);
    res.status(500).json({ message: 'Failed to record status' });
  }
};
exports.getSmokingStatusByStage = async (req, res) => {
  try {
    const statuses = await SmokingStatus.find({
      plan_id: req.params.planId,
      stage_id: req.params.stageId,
      user_id: req.user.id
    });
    res.json(statuses);
  } catch (error) {
    console.error('[getSmokingStatusByStage]', error);
    res.status(500).json({ message: 'Failed to fetch smoking statuses' });
  }
};
