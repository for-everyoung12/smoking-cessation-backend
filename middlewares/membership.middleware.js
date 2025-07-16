const UserMembership = require("../models/userMembership.model");

const checkMembershipPermission = (permissionField) => {
  return async (req, res, next) => {
    try {
      if (req.user?.role === "admin") {
        return next();
      }

      const membership = await UserMembership.findOne({
        user_id: req.user.id,
        status: "active",
        $or: [
          { expire_date: null },
          { expire_date: { $gte: new Date() } }
        ]
      }).populate("package_id");      

      if (!membership || !membership.package_id?.[permissionField]) {
        return res.status(403).json({
          message: `Your membership does not allow this action (${permissionField})`,
        });
      }

      next();
    } catch (error) {
      console.error("[Membership Check Error]", error);
      res.status(500).json({ message: "Permission check failed" });
    }
  };
};

module.exports = {
  checkMembershipPermission,
};
