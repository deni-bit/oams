const asyncHandler = require('express-async-handler');
const Auction      = require('../models/Auction');
const Bid          = require('../models/Bid');
const User         = require('../models/User');

// @desc    Get overall auction summary
// @route   GET /api/reports/summary
// @access  Admin
const getSummary = asyncHandler(async (req, res) => {
  const totalAuctions  = await Auction.countDocuments();
  const liveAuctions   = await Auction.countDocuments({ status: 'live' });
  const endedAuctions  = await Auction.countDocuments({ status: 'ended' });
  const totalBids      = await Bid.countDocuments();
  const totalUsers     = await User.countDocuments();
  const totalBuyers    = await User.countDocuments({ role: 'buyer' });

  // Total revenue from ended auctions (sum of currentBid)
  const revenueResult = await Auction.aggregate([
    { $match: { status: 'ended' } },
    { $group: { _id: null, totalRevenue: { $sum: '$currentBid' } } },
  ]);
  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

  // Average bid amount
  const avgBidResult = await Bid.aggregate([
    { $group: { _id: null, avgBid: { $avg: '$amount' } } },
  ]);
  const averageBid = Math.round(avgBidResult[0]?.avgBid || 0);

  // Highest single bid
  const highestBidResult = await Bid.aggregate([
    { $group: { _id: null, highestBid: { $max: '$amount' } } },
  ]);
  const highestBid = highestBidResult[0]?.highestBid || 0;

  res.json({
    totalAuctions,
    liveAuctions,
    endedAuctions,
    totalBids,
    totalUsers,
    totalBuyers,
    totalRevenue,
    averageBid,
    highestBid,
  });
});

// @desc    Get auctions by category breakdown
// @route   GET /api/reports/by-category
// @access  Admin
const getByCategory = asyncHandler(async (req, res) => {
  const data = await Auction.aggregate([
    {
      $group: {
        _id:          '$category',
        count:        { $sum: 1 },
        totalRevenue: { $sum: '$currentBid' },
        avgBid:       { $avg: '$currentBid' },
      },
    },
    { $sort: { count: -1 } },
  ]);

  res.json(data);
});

// @desc    Get top bidders
// @route   GET /api/reports/top-bidders
// @access  Admin
const getTopBidders = asyncHandler(async (req, res) => {
  const data = await Bid.aggregate([
    {
      $group: {
        _id:       '$bidder',
        totalBids: { $sum: 1 },
        highestBid:{ $max: '$amount' },
        totalSpent:{ $sum: '$amount' },
      },
    },
    { $sort: { totalBids: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from:         'users',
        localField:   '_id',
        foreignField: '_id',
        as:           'user',
      },
    },
    { $unwind: '$user' },
    {
      $project: {
        name:       '$user.name',
        email:      '$user.email',
        totalBids:  1,
        highestBid: 1,
        totalSpent: 1,
      },
    },
  ]);

  res.json(data);
});

// @desc    Get recent activity (latest bids + auctions)
// @route   GET /api/reports/recent-activity
// @access  Admin
const getRecentActivity = asyncHandler(async (req, res) => {
  const recentBids = await Bid.find({})
    .populate('bidder',  'name email')
    .populate('auction', 'title status')
    .sort({ createdAt: -1 })
    .limit(10);

  const recentAuctions = await Auction.find({})
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({ recentBids, recentAuctions });
});

// @desc    Get monthly auction stats
// @route   GET /api/reports/monthly
// @access  Admin
const getMonthlyStats = asyncHandler(async (req, res) => {
  const data = await Auction.aggregate([
    {
      $group: {
        _id: {
          year:  { $year:  '$createdAt' },
          month: { $month: '$createdAt' },
        },
        totalAuctions: { $sum: 1 },
        totalRevenue:  { $sum: '$currentBid' },
        totalBids:     { $sum: '$totalBids' },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 },
  ]);

  res.json(data);
});

module.exports = {
  getSummary,
  getByCategory,
  getTopBidders,
  getRecentActivity,
  getMonthlyStats,
};