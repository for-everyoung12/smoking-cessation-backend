// controllers/quitGoalDraft.controller.js
const QuitGoalDraft = require('../models/quitGoalDraft.model');

exports.upsertGoalDraft = async (req, res) => {
  const { goal } = req.body;

  if (!goal || goal.trim() === "") {
    return res.status(400).json({ message: "Goal description is required" });
  }

  try {
    const draft = await QuitGoalDraft.findOneAndUpdate(
      { user_id: req.user.id },
      { goal, created_at: new Date() },
      { upsert: true, new: true }
    );
    res.status(201).json({ message: "Goal draft saved", draft });
  } catch (err) {
    console.error("[upsertGoalDraft]", err);
    res.status(500).json({ message: "Failed to save goal draft" });
  }
};

exports.getGoalDraft = async (req, res) => {
  try {
    const draft = await QuitGoalDraft.findOne({ user_id: req.user.id });
    if (!draft) {
  return res.status(200).json({ goal: null }); // hoặc {} nếu bạn muốn đơn giản hơn
}
res.json(draft);
  } catch (err) {
    console.error("[getGoalDraft]", err);
    res.status(500).json({ message: "Failed to fetch goal draft" });
  }
};

exports.deleteGoalDraft = async (req, res) => {
  try {
    await QuitGoalDraft.deleteOne({ user_id: req.user.id });
    res.json({ message: "Goal draft deleted" });
  } catch (err) {
    console.error("[deleteGoalDraft]", err);
    res.status(500).json({ message: "Failed to delete goal draft" });
  }
};
