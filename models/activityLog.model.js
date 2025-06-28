const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    status: { type: String, enum: ['success', 'pending', 'error', 'info'], default: 'info' }
  },
  { timestamps: true }
);

activityLogSchema.index({ createdAt: -1 }); 

module.exports = mongoose.model('ActivityLog', activityLogSchema);
