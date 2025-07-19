const ChatSession = require("../models/chatSession.model");
const CoachUser = require("../models/coachUser.model");
const CoachMessage = require("../models/coachMessage.model");
const QuitPlan = require("../models/quitPlan.model");
const User = require("../models/user.model");

exports.getOrCreateSession = async (req, res) => {
  try {
    const userId = req.user.id;

    // Kiểm tra session đang mở
    let session = await ChatSession.findOne({ user_id: userId, status: 'open' })
      .populate('coach_id', 'full_name');

    if (session) {
      return res.status(200).json({ success: true, data: session });
    }

    const quitPlan = await QuitPlan.findOne({ user_id: userId, status: 'ongoing' });
    if (!quitPlan || !quitPlan.coach_user_id) {
      return res.status(400).json({
        success: false,
        message: 'Bạn cần có quit plan đang hoạt động và đã chọn coach để bắt đầu chat.'
      });
    }

    const coach = await User.findById(quitPlan.coach_user_id);
    if (!coach || coach.role !== 'coach') {
      return res.status(404).json({ success: false, message: 'Không tìm thấy coach đã gán' });
    }

    // Tạo session
    session = await ChatSession.create({
      user_id: userId,
      coach_id: coach._id,
      created_at: new Date(),
      status: 'open',
      last_active_at: new Date()
    });

    // Ghi nhận quan hệ coach-user
    await CoachUser.findOneAndUpdate(
      { user_id: userId, coach_id: coach._id },
      { status: 'active', created_at: new Date() },
      { upsert: true }
    );

    session = await ChatSession.findById(session._id).populate('coach_id', 'full_name');

    return res.status(201).json({ success: true, data: session });
  } catch (err) {
    console.error('[getOrCreateSession]', err);
    return res.status(500).json({ success: false, message: 'Không thể tạo hoặc lấy session' });
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
    res.status(500).json({ success: false, message: "Không thể lấy danh sách session" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await ChatSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: "Không tìm thấy session" });
    }

    if (
      session.user_id.toString() !== req.user.id &&
      session.coach_id.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "Không có quyền truy cập" });
    }

    const messages = await CoachMessage.find({ session_id: sessionId })
      .sort({ sent_at: 1 })
      .populate("user_id", "full_name");

    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    console.error("[getMessages]", err);
    res.status(500).json({ success: false, message: "Không thể lấy tin nhắn" });
  }
};

exports.closeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await ChatSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: "Không tìm thấy session" });
    }

    if (
      session.user_id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Không có quyền đóng session" });
    }

    session.status = "closed";
    await session.save();

    res.status(200).json({ success: true, message: "Session đã được đóng" });
  } catch (err) {
    console.error("[closeSession]", err);
    res.status(500).json({ success: false, message: "Đóng session thất bại" });
  }
};
