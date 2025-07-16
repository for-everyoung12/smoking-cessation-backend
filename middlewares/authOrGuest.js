const jwt = require('jsonwebtoken');

const authOrGuest = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;    
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;  
    } else {
      req.user = user;
    }
    next();
  });
};

module.exports = authOrGuest;
