const ChatSession = require("../models/chatSession.model");
const CoachUser = require("../models/coachUser.model");
const CoachMessage = require("../models/coachMessage.model");
const User = require("../models/user.model");

exports.getOrCreateSession = async (req, res) => {
  try {
    const userId = req.user.id;

    // Tìm session đã mở, và populate coach_id để lấy tên
    let session = await ChatSession.findOne({ user_id: userId, status: 'open' })
      .populate('coach_id', 'full_name');

    if (session) {
      return res.status(200).json({ success: true, data: session });
    }

    // Nếu chưa có session, tìm coach bất kỳ
    const coach = await User.findOne({ role: 'coach' });
    if (!coach) {
      return res.status(503).json({ success: false, message: 'No coach available' });
    }

    // Tạo session mới
    session = await ChatSession.create({
      user_id: userId,
      coach_id: coach._id,
      created_at: new Date(),
      status: 'open',
      last_active_at: new Date()
    });

    // Ghi lại mối quan hệ coach-user
    await CoachUser.findOneAndUpdate(
      { user_id: userId, coach_id: coach._id },
      { status: 'active', created_at: new Date() },
      { upsert: true }
    );

    // Populate lại sau khi tạo để gửi cho FE
    session = await ChatSession.findById(session._id).populate('coach_id', 'full_name');
    
    return res.status(201).json({ success: true, data: session });
  } catch (err) {
    console.error('[getOrCreateSession]', err);
    return res.status(500).json({ success: false, message: 'Failed to create or get session' });
  }
};


exports.getSessionsByCoach = async (req, res) => {
  try {
    const coachId = req.user.id;

    const sessions = await ChatSession.find({
      coach_id: coachId,
      status: "open",
    })
      .sort({ last_active_at: -1 })
      .populate("user_id", "full_name email");

    res.status(200).json({ success: true, data: sessions });
  } catch (err) {
    console.error("[getSessionsByCoach]", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch sessions" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await ChatSession.findById(sessionId);
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    if (
      session.user_id.toString() !== req.user.id &&
      session.coach_id.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Permission denied" });
    }

    const messages = await CoachMessage.find({ session_id: sessionId })
      .sort({ sent_at: 1 })
      .populate("user_id", "full_name");
    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    console.error("[getMessages]", err);
    res.status(500).json({ success: false, message: "Failed to get messages" });
  }
};

exports.closeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await ChatSession.findById(sessionId);
    if (!session) {
      return res
        .status(404)
        .json({ success: false, message: "Session not found" });
    }

    if (
      session.user_id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Permission denied" });
    }

    session.status = "closed";
    await session.save();

    res.status(200).json({ success: true, message: "Session closed" });
  } catch (err) {
    console.error("[closeSession]", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to close session" });
  }
};
