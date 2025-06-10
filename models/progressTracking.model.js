const mongoose = require('mongoose');

const progressTrackingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'QuitPlan', required: true },
  stage_id: { type: mongoose.Schema.Types.ObjectId, ref: 'QuitStage', required: true },
  date: { type: Date, default: Date.now },
  cigarette_count: { type: Number, required: true },
  note: { type: String }
});

const progressTracking = mongoose.model('ProgressTracking', progressTrackingSchema);
module.exports = progressTracking;