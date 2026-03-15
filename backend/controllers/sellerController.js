const asyncHandler = require('express-async-handler');
const Auction      = require('../models/Auction');
const Bid          = require('../models/Bid');
const User         = require('../models/User');

// @desc    Get seller dashboard stats
// @route   GET /api/seller/dashboard
// @access  Seller
const getSellerDashboard = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;

  const totalListings   = await Auction.countDocuments({ createdBy: sellerId });
  const liveListings    = await Auction.countDocuments({ createdBy: sellerId, status: 'live' });
  const pendingListings = await Auction.countDocuments({ createdBy: sellerId, approvalStatus: 'pending' });
  const endedListings   = await Auction.countDocuments({ createdBy: sellerId, status: 'ended' });

  // Total revenue from ended auctions
  const revenueResult = await Auction.aggregate([
    { $match: { createdBy: sellerId, status: 'ended' } },
    { $group: { _id: null, total: { $sum: '$currentBid' } } },
  ]);
  const totalRevenue = revenueResult[0]?.total || 0;

  // Total bids across all listings
  const myAuctions   = await Auction.find({ createdBy: sellerId }).select('_id');
  const auctionIds   = myAuctions.map(a => a._id);
  const totalBids    = await Bid.countDocuments({ auction: { $in: auctionIds } });

  // Recent listings
  const recentListings = await Auction.find({ createdBy: sellerId })
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    totalListings,
    liveListings,
    pendingListings,
    endedListings,
    totalRevenue,
    totalBids,
    recentListings,
  });
});

// @desc    Get seller's own listings
// @route   GET /api/seller/listings
// @access  Seller
const getMyListings = asyncHandler(async (req, res) => {
  const { status, approvalStatus } = req.cleanQuery || req.query;

  const filter = { createdBy: req.user._id };
  if (status)         filter.status         = status;
  if (approvalStatus) filter.approvalStatus = approvalStatus;

  const listings = await Auction.find(filter)
    .populate('highestBidder', 'name email')
    .sort({ createdAt: -1 });

  res.json(listings);
});

// @desc    Create a new listing (pending approval)
// @route   POST /api/seller/listings
// @access  Seller
const createListing = asyncHandler(async (req, res) => {
  const {
    title, description, category,
    startingBid, startDate, endDate, images,
  } = req.body;

  if (!title || !description || !category || !startingBid || !startDate || !endDate) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }

  if (isNaN(startingBid) || Number(startingBid) <= 0) {
    res.status(400);
    throw new Error('Starting bid must be a positive number');
  }

  if (new Date(endDate) <= new Date(startDate)) {
    res.status(400);
    throw new Error('End date must be after start date');
  }

  const listing = await Auction.create({
    title:          title.trim(),
    description:    description.trim(),
    category,
    startingBid:    Number(startingBid),
    currentBid:     Number(startingBid),
    startDate,
    endDate,
    images:         images || [],
    createdBy:      req.user._id,
    listedBy:       'seller',
    approvalStatus: 'pending',
    status:         'pending',
  });

  res.status(201).json({
    success: true,
    message: 'Listing submitted for admin approval',
    listing,
  });
});

// @desc    Update own listing (only if pending)
// @route   PUT /api/seller/listings/:id
// @access  Seller
const updateListing = asyncHandler(async (req, res) => {
  const listing = await Auction.findById(req.params.id);

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  // Only owner can update
  if (listing.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this listing');
  }

  // Can only edit pending listings
  if (listing.approvalStatus !== 'pending') {
    res.status(400);
    throw new Error('Can only edit listings that are pending approval');
  }

  const {
    title, description, category,
    startingBid, startDate, endDate, images,
  } = req.body;

  const updated = await Auction.findByIdAndUpdate(
    req.params.id,
    {
      title, description, category,
      startingBid, currentBid: startingBid,
      startDate, endDate, images,
    },
    { new: true, runValidators: true }
  );

  res.json({ success: true, listing: updated });
});

// @desc    Delete own listing (only if pending or upcoming)
// @route   DELETE /api/seller/listings/:id
// @access  Seller
const deleteListing = asyncHandler(async (req, res) => {
  const listing = await Auction.findById(req.params.id);

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  if (listing.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this listing');
  }

  if (listing.status === 'live' && listing.totalBids > 0) {
    res.status(400);
    throw new Error('Cannot delete a live listing with active bids');
  }

  if (listing.status === 'ended') {
    res.status(400);
    throw new Error('Cannot delete an ended listing');
  }

  await listing.deleteOne();

  res.json({ success: true, message: 'Listing deleted successfully' });
});

// @desc    Get bids on seller's listings
// @route   GET /api/seller/listings/:id/bids
// @access  Seller
const getListingBids = asyncHandler(async (req, res) => {
  const listing = await Auction.findById(req.params.id);

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  if (listing.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view these bids');
  }

  const bids = await Bid.find({ auction: req.params.id })
    .populate('bidder', 'name email')
    .sort({ amount: -1 });

  res.json(bids);
});

// @desc    Update seller profile
// @route   PUT /api/seller/profile
// @access  Seller
const updateSellerProfile = asyncHandler(async (req, res) => {
  const { businessName, description } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      'sellerProfile.businessName': businessName,
      'sellerProfile.description':  description,
    },
    { new: true }
  ).select('-password');

  res.json({ success: true, user });
});

module.exports = {
  getSellerDashboard,
  getMyListings,
  createListing,
  updateListing,
  deleteListing,
  getListingBids,
  updateSellerProfile,
};