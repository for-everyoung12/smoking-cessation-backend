const ActivityLog = require('../models/activityLog.model');

const logActivity = (message, status = 'info') => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.id || null;
      await ActivityLog.create({ user_id: userId, message, status });
    } catch (err) {
      console.error('[logActivity]', err);
    }
    next();
  };
};

module.exports = logActivity;
