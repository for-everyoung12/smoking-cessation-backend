const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

exports.getCoaches = async (req, res) => {
  try {
    const coaches = await User.find({ role: 'coach' }).select('-password');
    res.json(coaches);
  } catch (error) {
    console.error('[getCoaches]', error);
    res.status(500).json({ message: 'Failed to fetch coaches' });
  }
};

exports.createCoach = async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      specialization,
      experience,
      birth_date,
      gender
    } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const coachData = {
      full_name,
      email,
      password: hashedPassword,
      role: 'coach',
      isEmailVerified: true,
      specialization,
      experience,
      birth_date,
      gender,
      max_users: 10,
      current_users: 0
    };

    if (req.file) {
      coachData.avatar = req.file.path; // Cloudinary URL
    }

    const newCoach = await User.create(coachData);

    res.status(201).json({ message: 'Coach created successfully', coach: newCoach });
  } catch (error) {
    console.error('[createCoach]', error);
    res.status(500).json({ message: 'Failed to create coach' });
  }
};

exports.getCoachById = async (req, res) => {
  try {
    const coach = await User.findById(req.params.id).select('-password');
    if (!coach || coach.role !== 'coach') {
      return res.status(404).json({ message: 'Coach not found' });
    }
    res.json(coach);
  } catch (error) {
    console.error('[getCoachById]', error);
    res.status(500).json({ message: 'Failed to fetch coach' });
  }
};

exports.updateCoach = async (req, res) => {
  try {
    const coachId = req.params.id;
    const {
      full_name,
      specialization,
      experience,
      birth_date,
      gender
    } = req.body;

    const updates = {
      full_name,
      specialization,
      experience,
      birth_date,
      gender
    };

    if (req.file) {
      updates.avatar = req.file.path;
    }

    const updatedCoach = await User.findByIdAndUpdate(coachId, updates, {
      new: true,
    }).select("-password");

    if (!updatedCoach) return res.status(404).json({ message: 'Coach not found' });

    res.json({ message: 'Coach updated successfully', coach: updatedCoach });
  } catch (error) {
    console.error('[updateCoach]', error);
    res.status(500).json({ message: 'Failed to update coach' });
  }
};

exports.deleteCoach = async (req, res) => {
  try {
    const coachId = req.params.id;

    const deletedCoach = await User.findByIdAndDelete(coachId);
    if (!deletedCoach) return res.status(404).json({ message: 'Coach not found' });

    res.json({ message: 'Coach deleted successfully' });
  } catch (error) {
    console.error('[deleteCoach]', error);
    res.status(500).json({ message: 'Failed to delete coach' });
  }
};
