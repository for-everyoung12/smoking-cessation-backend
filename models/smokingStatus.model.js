const mongoose = require('mongoose');

const smokingStatusSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'QuitPlan', required: true },
  stage_id: { type: mongoose.Schema.Types.ObjectId, ref: 'QuitStage', required: true },
  record_date: { type: Date, default: Date.now },
  cigarette_count: { type: Number, required: true, min: 0 },
  time_of_smoking: { type: Date }, // thời gian hút từng điếu 
  money_spent: { type: Number, min: 0, default: 0 },
  health_note: { type: String, trim: true }
}, { timestamps: true });

const SmokingStatus = mongoose.model('SmokingStatus', smokingStatusSchema);
module.exports = SmokingStatus;
