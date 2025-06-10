const mongoose = require('mongoose');

const quitStageSchema = new mongoose.Schema({
  plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'QuitPlan', required: true },
  name: { type: String, required: true },
  description: { type: String },
  start_date: { type: Date },
  end_date: { type: Date },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed', 'skipped'],
    default: 'not_started'
  }
});


const QuitStage = mongoose.model('QuitStage', quitStageSchema);
module.exports = QuitStage;