const ChatSession = require('../models/chatSession.model');
const CoachUser = require('../models/coachUser.model');
const CoachMessage = require('../models/coachMessage.model');
const User = require('../models/user.model');

exports.getOrCreateSession = async (req, res) => {
  try {
    const userId = req.user.id;

    let session = await ChatSession.findOne({ user_id: userId, status: 'open' });
    if (session) {
      return res.status(200).json({ success: true, data: session });
    }

    const coach = await User.findOne({ role: 'coach' });
    if (!coach) {
      return res.status(503).json({ success: false, message: 'No coach available' });
    }

    session = await ChatSession.create({
      user_id: userId,
      coach_id: coach._id,
      created_at: new Date(),
      status: 'open',
      last_active_at: new Date()
    });

    await CoachUser.findOneAndUpdate(
      { user_id: userId, coach_id: coach._id },
      { status: 'active', created_at: new Date() },
      { upsert: true }
    );

    res.status(201).json({ success: true, data: session });
  } catch (err) {
    console.error('[getOrCreateSession]', err);
    res.status(500).json({ success: false, message: 'Failed to create or get session' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await ChatSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (
      session.user_id.toString() !== req.user.id &&
      session.coach_id.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }

    const messages = await CoachMessage.find({ session_id: sessionId })
      .sort({ sent_at: 1 })
      .populate('user_id', 'full_name');
    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    console.error('[getMessages]', err);
    res.status(500).json({ success: false, message: 'Failed to get messages' });
  }
};

exports.closeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await ChatSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (
      session.user_id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Permission denied' });
    }

    session.status = 'closed';
    await session.save();

    res.status(200).json({ success: true, message: 'Session closed' });
  } catch (err) {
    console.error('[closeSession]', err);
    res.status(500).json({ success: false, message: 'Failed to close session' });
  }
};
