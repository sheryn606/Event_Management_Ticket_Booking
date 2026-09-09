const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/organizerController');
const { protect, requireRole } = require('../middleware/auth');

router.use(protect);

// Allow organizers and admins
const authorizeDashboard = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'organizer') {
    return next();
  }
  res.status(403);
  const error = new Error('Not authorized');
  error.errorCode = 'FORBIDDEN';
  return next(error);
};

router.get('/:id/dashboard', authorizeDashboard, getDashboard);

module.exports = router;
