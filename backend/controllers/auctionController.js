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

  // Validate startingBid
  if (isNaN(startingBid) || Number(startingBid) <= 0) {
    res.status(400);
    throw new Error('Starting bid must be a positive number');
  }

  // Validate dates
  if (new Date(endDate) <= new Date(startDate)) {
    res.status(400);
    throw new Error('End date must be after start date');
  }

  const auction = await Auction.create({
    title:      title.trim(),
    description:description.trim(),
    category,
    startingBid:Number(startingBid),
    currentBid: Number(startingBid),
    startDate,
    endDate,
    images:     images || [],
    createdBy:  req.user._id,
    status:     new Date(startDate) > new Date() ? 'upcoming' : 'live',
  });

  res.status(201).json(auction);
});

// @desc    Get all auctions
// @route   GET /api/auctions
// @access  Public
const getAuctions = asyncHandler(async (req, res) => {
  // Use cleanQuery from HPP middleware, fallback to req.query
  const { status, category, search } = req.cleanQuery || req.query;

  const filter = {};
  if (status)   filter.status   = status;
  if (category) filter.category = category;
  if (search)   filter.title    = { $regex: search, $options: 'i' };

  const auctions = await Auction.find(filter)
    .populate('createdBy',     'name email')
    .populate('highestBidder', 'name email')
    .sort({ createdAt: -1 });

  res.json(auctions);
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

  // Prevent updating sensitive fields directly
  const { currentBid, highestBidder, totalBids, createdBy, ...safeFields } = req.body;

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

  // Prevent invalid status transitions
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

  // ─────────────────────────────────────────
  // REAL-TIME BROADCAST via WebSocket
  // Notify all users watching this auction
  // ─────────────────────────────────────────
  const io = req.app.get('io');
  emitAuctionStatusChanged(io, req.params.id, status);

  res.json({
    success: true,
    message: `Auction status updated to ${status}`,
    auction,
  });
});

module.exports = {
  createAuction,
  getAuctions,
  getAuctionById,
  updateAuction,
  deleteAuction,
  updateAuctionStatus,
};