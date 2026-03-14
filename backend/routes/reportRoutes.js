const express = require('express');
const router  = express.Router();

const {
  getSummary,
  getByCategory,
  getTopBidders,
  getRecentActivity,
  getMonthlyStats,
} = require('../controllers/reportController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/summary',         protect, adminOnly, getSummary);
router.get('/by-category',     protect, adminOnly, getByCategory);
router.get('/top-bidders',     protect, adminOnly, getTopBidders);
router.get('/recent-activity', protect, adminOnly, getRecentActivity);
router.get('/monthly',         protect, adminOnly, getMonthlyStats);

module.exports = router;