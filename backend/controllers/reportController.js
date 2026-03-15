const asyncHandler = require('express-async-handler');
const Auction      = require('../models/Auction');
const Bid          = require('../models/Bid');
const User         = require('../models/User');

// @desc    Get overall auction summary
// @route   GET /api/reports/summary
// @access  Admin
const getSummary = asyncHandler(async (req, res) => {
  const totalAuctions    = await Auction.countDocuments();
  const liveAuctions     = await Auction.countDocuments({ status: 'live' });
  const endedAuctions    = await Auction.countDocuments({ status: 'ended' });
  const upcomingAuctions = await Auction.countDocuments({ status: 'upcoming' });
  const pendingListings  = await Auction.countDocuments({ approvalStatus: 'pending' });
  const totalBids        = await Bid.countDocuments();
  const totalUsers       = await User.countDocuments();
  const totalBuyers      = await User.countDocuments({ role: 'buyer'  });
  const totalSellers     = await User.countDocuments({ role: 'seller' });
  const totalAdmins      = await User.countDocuments({ role: 'admin'  });

  // Total revenue from ended auctions
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

  // Total active bids right now
  const activeBids = await Bid.countDocuments({ status: 'active' });

  // Seller listings breakdown
  const sellerListings = await Auction.countDocuments({ listedBy: 'seller' });
  const adminListings  = await Auction.countDocuments({ listedBy: 'admin'  });

  res.json({
    // Auction stats
    totalAuctions,
    liveAuctions,
    endedAuctions,
    upcomingAuctions,
    pendingListings,
    sellerListings,
    adminListings,

    // Bid stats
    totalBids,
    activeBids,
    averageBid,
    highestBid,

    // Revenue
    totalRevenue,

    // User stats
    totalUsers,
    totalBuyers,
    totalSellers,
    totalAdmins,
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
        livCount:     { $sum: { $cond: [{ $eq: ['$status', 'live']  }, 1, 0] } },
        endedCount:   { $sum: { $cond: [{ $eq: ['$status', 'ended'] }, 1, 0] } },
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
        _id:        '$bidder',
        totalBids:  { $sum: 1 },
        highestBid: { $max: '$amount' },
        totalSpent: { $sum: '$amount' },
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

// @desc    Get top sellers by revenue
// @route   GET /api/reports/top-sellers
// @access  Admin
const getTopSellers = asyncHandler(async (req, res) => {
  const data = await Auction.aggregate([
    {
      $match: {
        listedBy: 'seller',
        status:   'ended',
      },
    },
    {
      $group: {
        _id:          '$createdBy',
        totalSales:   { $sum: 1 },
        totalRevenue: { $sum: '$currentBid' },
        avgSalePrice: { $avg: '$currentBid' },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from:         'users',
        localField:   '_id',
        foreignField: '_id',
        as:           'seller',
      },
    },
    { $unwind: '$seller' },
    {
      $project: {
        name:         '$seller.name',
        email:        '$seller.email',
        businessName: '$seller.sellerProfile.businessName',
        totalSales:   1,
        totalRevenue: 1,
        avgSalePrice: { $round: ['$avgSalePrice', 0] },
      },
    },
  ]);

  res.json(data);
});

// @desc    Get recent activity
// @route   GET /api/reports/recent-activity
// @access  Admin
const getRecentActivity = asyncHandler(async (req, res) => {
  const recentBids = await Bid.find({})
    .populate('bidder',  'name email')
    .populate('auction', 'title status')
    .sort({ createdAt: -1 })
    .limit(10);

  const recentAuctions = await Auction.find({})
    .populate('createdBy', 'name role')
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
        liveCount:     { $sum: { $cond: [{ $eq: ['$status', 'live']     }, 1, 0] } },
        endedCount:    { $sum: { $cond: [{ $eq: ['$status', 'ended']    }, 1, 0] } },
        sellerCount:   { $sum: { $cond: [{ $eq: ['$listedBy', 'seller'] }, 1, 0] } },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 },
  ]);

  res.json(data);
});

// @desc    Get approval stats — pending, approved, rejected
// @route   GET /api/reports/approval-stats
// @access  Admin
const getApprovalStats = asyncHandler(async (req, res) => {
  const data = await Auction.aggregate([
    {
      $match: { listedBy: 'seller' },
    },
    {
      $group: {
        _id:   '$approvalStatus',
        count: { $sum: 1 },
      },
    },
  ]);

  // Format into a clean object
  const result = { pending: 0, approved: 0, rejected: 0 };
  data.forEach(d => {
    result[d._id] = d.count;
  });

  // Average approval time for approved listings
  const approvedListings = await Auction.find({
    listedBy:       'seller',
    approvalStatus: 'approved',
  }).select('createdAt updatedAt');

  const avgApprovalHours = approvedListings.length > 0
    ? Math.round(
        approvedListings.reduce((acc, l) => {
          const diff = new Date(l.updatedAt) - new Date(l.createdAt);
          return acc + diff / (1000 * 60 * 60);
        }, 0) / approvedListings.length
      )
    : 0;

  res.json({
    ...result,
    total:             data.reduce((acc, d) => acc + d.count, 0),
    avgApprovalHours,
  });
});

module.exports = {
  getSummary,
  getByCategory,
  getTopBidders,
  getTopSellers,
  getRecentActivity,
  getMonthlyStats,
  getApprovalStats,
};