const User = require('../models/user.model');
const CoachUser = require('../models/coachUser.model');
const UserMembership = require('../models/userMembership.model');
const MembershipPackage = require('../models/membershipPackage.model');
const QuitPlan = require('../models/quitPlan.model');

const multer = require('multer');
const { storage } = require('../utils/cloudinary');
const upload = multer({ storage });
exports.getUserQuitPlans = async (req, res) => {
  try {
    const plans = await QuitPlan.find({ user_id: req.params.id });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
exports.getCurrentUser = async (req, res) => {
  try {
    if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error('[getCurrentUser ERROR]', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.updateCurrentUser = async (req, res) => {
  try {
    const { full_name, birth_date, gender } = req.body;
    const updateFields = { full_name, birth_date, gender };

    if (req.file) {
      updateFields.avatar = req.file.path; // Cloudinary URL
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (error) {
    console.error("Update failed:");
    console.dir(error, { depth: null });
    res.status(500).json({ error: error.message || "Update failed" });
  }
};

// controller
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Deletion failed' });
  }
};

exports.getUserCoach = async (req, res) => {
  try {
    const coachRel = await CoachUser.findOne({ user_id: req.params.id });
    if (!coachRel) return res.status(404).json({ message: 'Coach not assigned' });

    const coach = await User.findById(coachRel.coach_id).select('-password');
    res.json(coach);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserMembership = async (req, res) => {
  try {
    const membership = await UserMembership.findOne({ user_id: req.params.id })
      .sort({ payment_date: -1 })
      .populate('package_id');

    if (!membership) return res.status(404).json({ message: 'No active membership found' });

    res.json(membership);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getUserQuitPlans = async (req, res) => {
  try {
    const plans = await QuitPlan.find({ user_id: req.params.id });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


