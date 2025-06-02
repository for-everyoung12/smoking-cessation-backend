// Chỉ cho phép vai trò cụ thể
const allowRoles = (...allowedRoles) => {
    return (req, res, next) => {
      const userRole = req.user?.role || 'member';
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      next();
    };
  };
  
  const isAdmin = allowRoles('admin');
  const isCoach = allowRoles('coach', 'admin');
  
  module.exports = {
    allowRoles,
    isAdmin,
    isCoach
  };
  