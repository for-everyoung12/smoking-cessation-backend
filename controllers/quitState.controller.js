const QuitStage = require('../models/quitStage.model');
const ProgressTracking = require("../models/progressTracking.model");
exports.getStagesByPlan = async (req, res) => {
  try {
    const stages = await QuitStage.find({ plan_id: req.params.planId }).sort({ start_date: 1 });

    const userId = req.user.id;
    const planId = req.params.planId;

    const getVNStartEndUTC = () => {
      const nowVN = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
      nowVN.setHours(0, 0, 0, 0);
      const vnStart = new Date(nowVN);
      const vnEnd = new Date(vnStart.getTime() + 24 * 60 * 60 * 1000);
      return {
        utcStart: new Date(vnStart.toISOString()),
        utcEnd: new Date(vnEnd.toISOString())
      };
    };

    const { utcStart, utcEnd } = getVNStartEndUTC();

    const enrichedStages = await Promise.all(
      stages.map(async (stage) => {
        const vnNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
        vnNow.setHours(0, 0, 0, 0);

        const start = new Date(stage.start_date);
        const end = new Date(stage.end_date);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        let status = "not_started";
        if (end < vnNow) status = "completed";
        else if (start <= vnNow && vnNow <= end) status = "in_progress";

        const progressDays = await ProgressTracking.countDocuments({
          user_id: userId,
          plan_id: planId,
          stage_id: stage._id,
        });

        const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

        
        let recordedToday = false;
        if (status === "in_progress") {
          const { utcStart, utcEnd } = getVNStartEndUTC();

          const existing = await ProgressTracking.findOne({
            user_id: userId,
            plan_id: planId,
            stage_id: stage._id,
            date: { $gte: utcStart, $lt: utcEnd },
          });

          recordedToday = !!existing;
        }

        return {
          ...stage.toObject(),
          status,
          recordedToday,
          progressDays,
          totalDays,
        };
      })
    );

    res.status(200).json(enrichedStages);
  } catch (error) {
    console.error('[getStagesByPlan]', error);
    res.status(500).json({ message: 'Failed to fetch stages' });
  }
};


exports.createStage = async (req, res) => {
  try {
    const { name, description, start_date, end_date, status } = req.body;
    const newStage = await QuitStage.create({
      plan_id: req.params.planId,
      name,
      description,
      start_date,
      end_date,
      status: status || 'not_started'
    });
    res.status(201).json({ message: 'Stage created', stage: newStage });
  } catch (error) {
    console.error('[createStage]', error);
    res.status(500).json({ message: 'Failed to create stage' });
  }
};

exports.updateStage = async (req, res) => {
  try {
    const updatedStage = await QuitStage.findOneAndUpdate(
      { _id: req.params.stageId, plan_id: req.params.planId },
      req.body,
      { new: true }
    );
    if (!updatedStage) return res.status(404).json({ message: 'Stage not found' });
    res.json({ message: 'Stage updated', stage: updatedStage });
  } catch (error) {
    console.error('[updateStage]', error);
    res.status(500).json({ message: 'Failed to update stage' });
  }
};

exports.deleteStage = async (req, res) => {
  try {
    const deletedStage = await QuitStage.findOneAndDelete({
      _id: req.params.stageId,
      plan_id: req.params.planId
    });
    if (!deletedStage) return res.status(404).json({ message: 'Stage not found' });
    res.json({ message: 'Stage deleted' });
  } catch (error) {
    console.error('[deleteStage]', error);
    res.status(500).json({ message: 'Failed to delete stage' });
  }
};
