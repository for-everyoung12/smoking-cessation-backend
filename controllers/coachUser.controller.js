const CoachUser = require('../models/coachUser.model');

exports.createCoachUser = async (req, res) => {
  try {
    const { coach_id, user_id, note } = req.body;
    const newRelation = await CoachUser.create({
      coach_id,
      user_id,
      note,
      status: 'active',
      created_at: new Date()
    });
    res.status(201).json({ message: 'Coach-User relation created', relation: newRelation });
  } catch (error) {
    console.error('[createCoachUser]', error);
    res.status(500).json({ message: 'Failed to create relation' });
  }
};

exports.getCoachUsers = async (req, res) => {
  try {
    const { coach_id, status } = req.query;
    const filter = {};
    if (coach_id) filter.coach_id = coach_id;
    if (status) filter.status = status;

    const relations = await CoachUser.find(filter)
      .populate('coach_id', 'full_name email')
      .populate('user_id', 'full_name email');
    res.json(relations);
  } catch (error) {
    console.error('[getCoachUsers]', error);
    res.status(500).json({ message: 'Failed to fetch relations' });
  }
};

exports.updateCoachUser = async (req, res) => {
  try {
    const updated = await CoachUser.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate('coach_id', 'full_name email')
      .populate('user_id', 'full_name email');
    if (!updated) return res.status(404).json({ message: 'Relation not found' });
    res.json({ message: 'Relation updated', relation: updated });
  } catch (error) {
    console.error('[updateCoachUser]', error);
    res.status(500).json({ message: 'Failed to update relation' });
  }
};

exports.deleteCoachUser = async (req, res) => {
  try {
    const deleted = await CoachUser.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Relation not found' });
    res.json({ message: 'Relation deleted' });
  } catch (error) {
    console.error('[deleteCoachUser]', error);
    res.status(500).json({ message: 'Failed to delete relation' });
  }
};
