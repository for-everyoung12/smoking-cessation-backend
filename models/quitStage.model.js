const mongoose = require('mongoose');

const quitStageSchema = new mongoose.Schema({
  plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'QuitPlan', required: true },
  name: { type: String, required: true },
  description: { type: String },
  start_date: { type: Date },
  end_date: { type: Date },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'skipped','failed'],
    default: 'not_started'
  },
  max_daily_cigarette: { type: Number, default: null }
});

const QuitStage = mongoose.model('QuitStage', quitStageSchema);
module.exports = QuitStage;
