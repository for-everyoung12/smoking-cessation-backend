const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
console.log("🔥 token:", token);
console.log("🔐 JWT_SECRET:", process.env.JWT_SECRET);

jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
  if (err) {
    console.log("❌ JWT verify failed:", err);
    return res.sendStatus(403);
  }
  console.log("✅ Token decoded:", user);
  req.user = user;
  next();
});

};
    
module.exports = authenticateToken;
