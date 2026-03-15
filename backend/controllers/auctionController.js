const asyncHandler = require('express-async-handler');
const Auction      = require('../models/Auction');
const Bid          = require('../models/Bid');
const { emitAuctionStatusChanged } = require('../utils/socketEvents');

// @desc    Create a new auction
// @route   POST /api/auctions
// @access  Admin
const createAuction = asyncHandler(async (req, res) => {
  const { title, description, category, startingBid, startDate, endDate, images } = req.body;

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

  const auction = await Auction.create({
    title:          title.trim(),
    description:    description.trim(),
    category,
    startingBid:    Number(startingBid),
    currentBid:     Number(startingBid),
    startDate,
    endDate,
    images:         images || [],
    createdBy:      req.user._id,
    listedBy:       'admin',
    approvalStatus: 'approved',
    status:         new Date(startDate) > new Date() ? 'upcoming' : 'live',
  });

  res.status(201).json(auction);
});

// @desc    Get all auctions — public view hides pending
// @route   GET /api/auctions
// @access  Public
const getAuctions = asyncHandler(async (req, res) => {
  const { status, category, search } = req.cleanQuery || req.query;

  const filter = {};

  if (status) {
    filter.status = status;
  } else {
    // Hide pending from public — only approved listings visible
    filter.status = { $ne: 'pending' };
  }

  // Also hide rejected listings from public
  filter.approvalStatus = { $ne: 'rejected' };

  if (category) filter.category = category;
  if (search)   filter.title    = { $regex: search, $options: 'i' };

  const auctions = await Auction.find(filter)
    .populate('createdBy',     'name email')
    .populate('highestBidder', 'name email')
    .sort({ createdAt: -1 });

  res.json(auctions);
});

// @desc    Get ALL auctions including pending — admin view
// @route   GET /api/auctions/admin/all
// @access  Admin
const getAllAuctionsAdmin = asyncHandler(async (req, res) => {
  const { status, category, search, approvalStatus } = req.cleanQuery || req.query;

  const filter = {};
  if (status)         filter.status         = status;
  if (category)       filter.category       = category;
  if (approvalStatus) filter.approvalStatus = approvalStatus;
  if (search)         filter.title          = { $regex: search, $options: 'i' };

  const auctions = await Auction.find(filter)
    .populate('createdBy',     'name email')
    .populate('highestBidder', 'name email')
    .sort({ createdAt: -1 });

  res.json(auctions);
});

// @desc    Get pending listings count + list — for admin dashboard
// @route   GET /api/auctions/admin/pending
// @access  Admin
const getPendingListings = asyncHandler(async (req, res) => {
  const pending = await Auction.find({ approvalStatus: 'pending' })
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.json({
    count:    pending.length,
    listings: pending,
  });
});

// @desc    Get single auction
// @route   GET /api/auctions/:id
// @access  Public
const getAuctionById = asyncHandler(async (req, res) => {
  const auction = await Auction.findById(req.params.id)
    .populate('createdBy',     'name email')
    .populate('highestBidder', 'name email');

  if (!auction) {
    res.status(404);
    throw new Error('Auction not found');
  }

  res.json(auction);
});

// @desc    Update auction
// @route   PUT /api/auctions/:id
// @access  Admin
const updateAuction = asyncHandler(async (req, res) => {
  const auction = await Auction.findById(req.params.id);

  if (!auction) {
    res.status(404);
    throw new Error('Auction not found');
  }

  if (auction.status === 'ended') {
    res.status(400);
    throw new Error('Cannot update an ended auction');
  }

  // Strip sensitive fields — cannot be set directly
  const {
    currentBid, highestBidder, totalBids,
    createdBy, approvalStatus, listedBy,
    ...safeFields
  } = req.body;

  const updated = await Auction.findByIdAndUpdate(
    req.params.id,
    safeFields,
    { new: true, runValidators: true }
  );

  res.json(updated);
});

// @desc    Delete auction
// @route   DELETE /api/auctions/:id
// @access  Admin
const deleteAuction = asyncHandler(async (req, res) => {
  const auction = await Auction.findById(req.params.id);

  if (!auction) {
    res.status(404);
    throw new Error('Auction not found');
  }

  if (auction.status === 'live' && auction.totalBids > 0) {
    res.status(400);
    throw new Error('Cannot delete a live auction with active bids. End it first.');
  }

  await Bid.deleteMany({ auction: req.params.id });
  await auction.deleteOne();

  res.json({
    success: true,
    message: 'Auction and all related bids removed',
  });
});

// @desc    Update auction status
// @route   PATCH /api/auctions/:id/status
// @access  Admin
const updateAuctionStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validStatuses = ['upcoming', 'live', 'ended', 'cancelled'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const auction = await Auction.findById(req.params.id);

  if (!auction) {
    res.status(404);
    throw new Error('Auction not found');
  }

  if (auction.status === 'ended' && status !== 'ended') {
    res.status(400);
    throw new Error('Cannot reopen an ended auction');
  }

  if (auction.status === 'cancelled' && status !== 'cancelled') {
    res.status(400);
    throw new Error('Cannot reopen a cancelled auction');
  }

  auction.status = status;
  await auction.save();

  // Broadcast to all watchers via WebSocket
  const io = req.app.get('io');
  emitAuctionStatusChanged(io, req.params.id, status);

  res.json({
    success: true,
    message: `Auction status updated to ${status}`,
    auction,
  });
});

// @desc    Approve a seller listing
// @route   PATCH /api/auctions/:id/approve
// @access  Admin
const approveListing = asyncHandler(async (req, res) => {
  const auction = await Auction.findById(req.params.id);

  if (!auction) {
    res.status(404);
    throw new Error('Listing not found');
  }

  if (auction.approvalStatus !== 'pending') {
    res.status(400);
    throw new Error('Listing is not pending approval');
  }

  auction.approvalStatus = 'approved';
  auction.status         = new Date(auction.startDate) > new Date()
    ? 'upcoming'
    : 'live';
  await auction.save();

  // Notify watchers via WebSocket
  const io = req.app.get('io');
  emitAuctionStatusChanged(io, auction._id.toString(), auction.status);

  res.json({
    success: true,
    message: 'Listing approved and is now visible to buyers',
    auction,
  });
});

// @desc    Reject a seller listing
// @route   PATCH /api/auctions/:id/reject-listing
// @access  Admin
const rejectListing = asyncHandler(async (req, res) => {
  const { reason } = req.body;

  const auction = await Auction.findById(req.params.id);

  if (!auction) {
    res.status(404);
    throw new Error('Listing not found');
  }

  if (auction.approvalStatus !== 'pending') {
    res.status(400);
    throw new Error('Listing is not pending approval');
  }

  auction.approvalStatus  = 'rejected';
  auction.status          = 'cancelled';
  auction.rejectionReason = reason || 'Does not meet listing requirements';
  await auction.save();

  res.json({
    success: true,
    message: 'Listing rejected successfully',
    auction,
  });
});

module.exports = {
  createAuction,
  getAuctions,
  getAuctionById,
  getAllAuctionsAdmin,
  getPendingListings,
  updateAuction,
  deleteAuction,
  updateAuctionStatus,
  approveListing,
  rejectListing,
};