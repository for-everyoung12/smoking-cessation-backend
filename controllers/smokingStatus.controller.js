const SmokingStatus = require('../models/smokingStatus.model');


exports.recordSmokingStatus = async (req, res) => {
  try {
    const { cigarette_count, time_of_smoking, money_spent, health_note, record_date } = req.body;

    const recordDate = record_date ? new Date(record_date) : new Date();
    recordDate.setHours(0, 0, 0, 0);

    const existing = await SmokingStatus.findOne({
      user_id: req.user.id,
      plan_id: req.params.planId,
      stage_id: req.params.stageId,
      record_date: {
        $gte: recordDate,
        $lt: new Date(recordDate.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (existing) {
      return res.status(409).json({
        message: 'You have already recorded your smoking status for today.'
      });
    }

    const status = await SmokingStatus.create({
      user_id: req.user.id,
      plan_id: req.params.planId,
      stage_id: req.params.stageId,
      record_date: recordDate,
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
exports.recordInitialSmokingStatus = async (req, res) => {
  try {
    const {
      cigarette_count,
      time_of_smoking,
      money_spent,
      health_note,
      suction_frequency,
      price_per_pack,
      packs_per_week
    } = req.body;

    const record = await SmokingStatus.create({
      user_id: req.user.id,
      cigarette_count,
      time_of_smoking,
      money_spent,
      health_note,
      suction_frequency,
      price_per_pack,
      packs_per_week,
      plan_id: null,
      stage_id: null,
      record_date: new Date()
    });

    res.status(201).json({ message: 'Initial smoking status recorded', record });
  } catch (error) {
    console.error('[recordInitialSmokingStatus]', error);
    res.status(500).json({ message: 'Failed to record initial status' });
  }
};


exports.getLatestPrePlanStatus = async (req, res) => {
  try {
    const status = await SmokingStatus.findOne({
      user_id: req.user.id,
      plan_id: null
    }).sort({ createdAt: -1 });

    if (!status) return res.status(404).json({ message: "No smoking status found" });
    res.json(status);
  } catch (err) {
    console.error("[getLatestPrePlanStatus]", err);
    res.status(500).json({ message: "Failed to fetch status" });
  }
};