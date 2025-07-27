const mongoose = require("mongoose");

const quitGoalDraftSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goal: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("QuitGoalDraft", quitGoalDraftSchema);
