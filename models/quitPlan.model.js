const mongoose = require('mongoose');

const quitPlanSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coach_user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  goal: { type: String, required: true }, 
  start_date: { type: Date, required: true },
  status: {
    type: String,
    enum: ['ongoing', 'completed', 'cancelled'],
    default: 'ongoing'
  },
  note: { type: String },
  reasons: [{ type: String }], 
  reasons_detail: { type: String },
});



const QuitPlan = mongoose.model('QuitPlan', quitPlanSchema);
module.exports = QuitPlan;