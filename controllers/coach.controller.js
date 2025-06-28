const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

exports.createCoach = async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newCoach = await User.create({
      full_name,
      email,
      password: hashedPassword,
      role: 'coach'
    });

    res.status(201).json({ message: 'Coach created', coach: newCoach });
  } catch (error) {
    console.error('[createCoach]', error);
    res.status(500).json({ message: 'Failed to create coach' });
  }
};

exports.getCoaches = async (req, res) => {
  try {
    const coaches = await User.find({ role: 'coach' }).select('-password');
    res.json(coaches);
  } catch (error) {
    console.error('[getCoaches]', error);
    res.status(500).json({ message: 'Failed to fetch coaches' });
  }
};

exports.updateCoach = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const coach = await User.findOneAndUpdate(
      { _id: req.params.coachId, role: 'coach' },
      updateData,
      { new: true }
    ).select('-password');

    if (!coach) return res.status(404).json({ message: 'Coach not found' });
    res.json({ message: 'Coach updated', coach });
  } catch (error) {
    console.error('[updateCoach]', error);
    res.status(500).json({ message: 'Failed to update coach' });
  }
};

exports.deleteCoach = async (req, res) => {
  try {
    const coach = await User.findOneAndDelete({
      _id: req.params.coachId,
      role: 'coach'
    });
    if (!coach) return res.status(404).json({ message: 'Coach not found' });
    res.json({ message: 'Coach deleted' });
  } catch (error) {
    console.error('[deleteCoach]', error);
    res.status(500).json({ message: 'Failed to delete coach' });
  }
};
