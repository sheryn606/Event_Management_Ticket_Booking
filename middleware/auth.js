const jwt = require('jsonwebtoken');

// Middleware to protect routes via JWT
const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user object to request
      req.user = {
        id: decoded.userId,
        role: decoded.role,
      };

      next();
    } catch (error) {
      res.status(401);
      next(error);
    }
  }

  if (!token) {
    res.status(401);
    const error = new Error('Not authorized, no token');
    error.errorCode = 'UNAUTHORIZED';
    next(error);
  }
};

// Middleware factory for Role-Based Access Control
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      res.status(403);
      const error = new Error(`Access forbidden: requires ${role} role`);
      error.errorCode = 'FORBIDDEN';
      return next(error);
    }
    next();
  };
};

module.exports = { protect, requireRole };
