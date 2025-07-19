const CoachUser = require('../models/coachUser.model');
const User = require('../models/user.model');

exports.createCoachUser = async (req, res) => {
  try {
    const { coach_id, user_id, note } = req.body;

    // 1. Check coach tồn tại & role đúng
    const coach = await User.findById(coach_id);
    if (!coach || coach.role !== 'coach') {
      return res.status(404).json({ message: 'Coach not found or invalid role' });
    }

    // 2. Kiểm tra số lượng kết nối
    if (coach.current_users >= coach.max_users) {
      return res.status(400).json({ message: 'Coach has reached max user limit' });
    }

    // 3. Check trùng kết nối
    const existing = await CoachUser.findOne({ coach_id, user_id });
    if (existing) {
      return res.status(400).json({ message: 'User already connected to this coach' });
    }

    // 4. Tạo mới
    const newRelation = await CoachUser.create({
      coach_id,
      user_id,
      note,
      status: 'active',
      created_at: new Date()
    });

    // 5. Tăng current_users
    coach.current_users += 1;
    await coach.save();

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

    // Nếu là quan hệ active → giảm current_users
    const coach = await User.findById(deleted.coach_id);
    if (coach && coach.role === 'coach' && coach.current_users > 0) {
      coach.current_users -= 1;
      await coach.save();
    }

    res.json({ message: 'Relation deleted' });
  } catch (error) {
    console.error('[deleteCoachUser]', error);
    res.status(500).json({ message: 'Failed to delete relation' });
  }
};


exports.getCoachByUserId = async (req, res) => {
  const { userId } = req.params;
  const mapping = await CoachUser.findOne({ user_id: userId, status: "active" });
  if (!mapping) return res.status(404).json({ message: "No coach found" });
  res.json({ coachId: mapping.coach_id });
};
