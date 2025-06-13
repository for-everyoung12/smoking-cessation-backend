const mongoose = require('mongoose');

const smokingStatusSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'QuitPlan' },
  stage_id: { type: mongoose.Schema.Types.ObjectId, ref: 'QuitStage' },
  record_date: { type: Date, default: Date.now },
  cigarette_count: { type: Number, required: true, min: 0 },
  time_of_smoking: { type: Date },
  money_spent: { type: Number, min: 0, default: 0 },
  suction_frequency: { type: String, enum: ['light', 'medium', 'heavy'], default: 'medium' },
  health_note: { type: String, trim: true },
  price_per_pack: { type: Number, min: 0 },
  packs_per_week: { type: Number, min: 0 },
}, { timestamps: true });



const SmokingStatus = mongoose.model('SmokingStatus', smokingStatusSchema);
module.exports = SmokingStatus;
