const QuitStage = require('../models/quitStage.model');

exports.getStagesByPlan = async (req, res) => {
  try {
    const stages = await QuitStage.find({ plan_id: req.params.planId }).sort({ start_date: 1 });
    res.status(200).json(stages);
  } catch (error) {
    console.error('[getStagesByPlan]', error);
    res.status(500).json({ message: 'Failed to fetch stages' });
  }
};

exports.createStage = async (req, res) => {
  try {
    const { name, description, start_date, end_date, status } = req.body;
    const newStage = await QuitStage.create({
      plan_id: req.params.planId,
      name,
      description,
      start_date,
      end_date,
      status: status || 'not_started'
    });
    res.status(201).json({ message: 'Stage created', stage: newStage });
  } catch (error) {
    console.error('[createStage]', error);
    res.status(500).json({ message: 'Failed to create stage' });
  }
};

exports.updateStage = async (req, res) => {
  try {
    const updatedStage = await QuitStage.findOneAndUpdate(
      { _id: req.params.stageId, plan_id: req.params.planId },
      req.body,
      { new: true }
    );
    if (!updatedStage) return res.status(404).json({ message: 'Stage not found' });
    res.json({ message: 'Stage updated', stage: updatedStage });
  } catch (error) {
    console.error('[updateStage]', error);
    res.status(500).json({ message: 'Failed to update stage' });
  }
};

exports.deleteStage = async (req, res) => {
  try {
    const deletedStage = await QuitStage.findOneAndDelete({
      _id: req.params.stageId,
      plan_id: req.params.planId
    });
    if (!deletedStage) return res.status(404).json({ message: 'Stage not found' });
    res.json({ message: 'Stage deleted' });
  } catch (error) {
    console.error('[deleteStage]', error);
    res.status(500).json({ message: 'Failed to delete stage' });
  }
};
