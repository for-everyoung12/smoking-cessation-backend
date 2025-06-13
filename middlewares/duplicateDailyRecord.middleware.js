const QuitStage = require('../models/quitStage.model');

module.exports = function checkDuplicateDailyRecord(model, dateFieldName = 'date') {
  return async (req, res, next) => {
    try {
      const recordDate = req.body[dateFieldName] ? new Date(req.body[dateFieldName]) : new Date();
      recordDate.setHours(0, 0, 0, 0);

      // 🔎 Lấy stage để kiểm tra ngày hợp lệ
      const stage = await QuitStage.findOne({
        _id: req.params.stageId,
        plan_id: req.params.planId
      });

      if (!stage) return res.status(404).json({ message: 'Stage not found' });

      const stageStart = new Date(stage.start_date);
      const stageEnd = new Date(stage.end_date);
      stageStart.setHours(0, 0, 0, 0);
      stageEnd.setHours(0, 0, 0, 0);

      if (recordDate < stageStart) {
        return res.status(400).json({
          message: `You cannot record before the stage starts on ${stageStart.toDateString()}.`
        });
      }

      if (recordDate > stageEnd) {
        return res.status(400).json({
          message: `You cannot record after the stage ends on ${stageEnd.toDateString()}.`
        });
      }

      // ✅ Kiểm tra trùng bản ghi trong ngày
      const existing = await model.findOne({
        user_id: req.user.id,
        plan_id: req.params.planId,
        stage_id: req.params.stageId,
        [dateFieldName]: {
          $gte: recordDate,
          $lt: new Date(recordDate.getTime() + 24 * 60 * 60 * 1000)
        }
      });

      if (existing) {
        return res.status(409).json({
          message: `You have already submitted a record for this date.`
        });
      }

      next();
    } catch (error) {
      console.error('[checkDuplicateDailyRecord]', error);
      res.status(500).json({ message: 'Internal server error while validating record.' });
    }
  };
};
