const ChatSession = require("../models/chatSession.model");
const CoachUser = require("../models/coachUser.model");
const CoachMessage = require("../models/coachMessage.model");
const QuitPlan = require("../models/quitPlan.model");
const User = require("../models/user.model");

exports.getOrCreateSession = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("[DEBUG] User ID from token:", userId);

    const activeCoachRel = await CoachUser.findOne({
      user_id: userId,
      status: 'active'
    });
    console.log("[DEBUG] Found coachUser:", activeCoachRel);

    if (!activeCoachRel) {
      return res.status(404).json({ message: 'No active coach assigned to you.' });
    }

    const coachId = activeCoachRel.coach_id;
    console.log("[DEBUG] Coach ID:", coachId);

    let session = await ChatSession.findOne({
      user_id: userId,
      coach_id: coachId
    }).populate('coach_id', 'full_name');
    console.log("[DEBUG] Found existing session:", session);

    if (!session) {
      session = await ChatSession.create({
        user_id: userId,
        coach_id: coachId,
        last_active_at: new Date(),
        status: 'open',
      });

      await session.populate('coach_id', 'full_name');
      console.log("[DEBUG] Created new session:", session);
    }

    res.json({ data: session });
  } catch (err) {
    console.error('[getOrCreateSession]', err);
    res.status(500).json({ message: 'Failed to get or create chat session' });
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
    res.status(500).json({ success: false, message: "Failed to retrieve chat sessions" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await ChatSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: "Chat session not found" });
    }

    if (
      session.user_id.toString() !== req.user.id &&
      session.coach_id.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const messages = await CoachMessage.find({ session_id: sessionId })
      .sort({ sent_at: 1 })
      .populate("user_id", "full_name");

    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    console.error("[getMessages]", err);
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
};

exports.closeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await ChatSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({ success: false, message: "Chat session not found" });
    }

    if (
      session.user_id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Permission denied to close session" });
    }

    session.status = "closed";
    await session.save();

    res.status(200).json({ success: true, message: "Chat session has been closed" });
  } catch (err) {
    console.error("[closeSession]", err);
    res.status(500).json({ success: false, message: "Failed to close chat session" });
  }
};
