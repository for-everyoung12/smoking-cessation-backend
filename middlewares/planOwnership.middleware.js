const QuitPlan = require('../models/quitPlan.model');
const mongoose = require("mongoose");
const verifyPlanOwnership = async (req, res, next) => {
  const { planId } = req.params;

  // ✅ Nếu không có planId (route không phải dạng /:planId), bỏ qua middleware
  if (!planId) return next();

  // ✅ Nếu planId tồn tại nhưng không phải ObjectId → chặn sớm
  if (!mongoose.Types.ObjectId.isValid(planId)) {
    return res.status(400).json({ message: "Invalid plan ID" });
  }

  try {
    const plan = await QuitPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Quit plan not found" });
    }

    const isOwner = plan.user_id.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Access denied to this plan" });
    }

    next();
  } catch (error) {
    console.error("[verifyPlanOwnership]", error);
    res.status(500).json({ message: "Error checking plan ownership" });
  }
};

module.exports = { verifyPlanOwnership };
