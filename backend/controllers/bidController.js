const asyncHandler = require('express-async-handler');
const Bid          = require('../models/Bid');
const Auction      = require('../models/Auction');

// ─── Place a bid ──────────────────────────────────────
// @route   POST /api/bids
// @access  Buyer
const placeBid = asyncHandler(async (req, res) => {
  const { auctionId, amount } = req.body;

  // Field presence check
  if (!auctionId || amount === undefined || amount === null) {
    res.status(400);
    throw new Error('Auction ID and bid amount are required');
  }

  // Numeric validation
  const bidAmount = parseFloat(amount);
  if (isNaN(bidAmount) || bidAmount <= 0) {
    res.status(400);
    throw new Error('Bid amount must be a positive number');
  }

  // Cap absurd bids
  if (bidAmount > 100_000_000) {
    res.status(400);
    throw new Error('Bid amount exceeds maximum allowed value of $100,000,000');
  }

  // Fetch auction
  const auction = await Auction.findById(auctionId);
  if (!auction) {
    res.status(404);
    throw new Error('Auction not found');
  }

  // Must be live
  if (auction.status !== 'live') {
    res.status(400);
    throw new Error(
      auction.status === 'upcoming'
        ? 'This auction has not started yet'
        : auction.status === 'ended'
        ? 'This auction has already ended'
        : 'Bidding is not allowed on this auction'
    );
  }

  // Cannot bid on own auction
  if (auction.createdBy.toString() === req.user._id.toString()) {
    res.status(403);
    throw new Error('You cannot bid on your own auction');
  }

  // Cannot bid if already the highest bidder
  if (
    auction.highestBidder &&
    auction.highestBidder.toString() === req.user._id.toString()
  ) {
    res.status(400);
    throw new Error('You are already the highest bidder on this auction');
  }

  // Must beat current bid
  if (bidAmount <= auction.currentBid) {
    res.status(400);
    throw new Error(
      `Your bid of $${bidAmount.toLocaleString()} must be higher than the current bid of $${auction.currentBid.toLocaleString()}`
    );
  }

  // Mark previous active bid as outbid
  await Bid.findOneAndUpdate(
    { auction: auctionId, status: 'active' },
    { status: 'outbid' }
  );

  // Create the new bid
  const bid = await Bid.create({
    auction: auctionId,
    bidder:  req.user._id,
    amount:  bidAmount,
    status:  'active',
  });

  // Update auction with new leading bid
  auction.currentBid    = bidAmount;
  auction.highestBidder = req.user._id;
  auction.totalBids    += 1;
  await auction.save();

  const populated = await bid.populate('bidder', 'name email');
  res.status(201).json(populated);
});

// ─── Get bids by auction ──────────────────────────────
// @route   GET /api/bids/auction/:auctionId
// @access  Public
const getBidsByAuction = asyncHandler(async (req, res) => {
  const bids = await Bid.find({ auction: req.params.auctionId })
    .populate('bidder', 'name email')
    .sort({ amount: -1 });

  res.json(bids);
});

// ─── Get my bids ──────────────────────────────────────
// @route   GET /api/bids/my
// @access  Private (Buyer)
const getMyBids = asyncHandler(async (req, res) => {
  const bids = await Bid.find({ bidder: req.user._id })
    .populate('auction', 'title currentBid status endDate images category')
    .sort({ createdAt: -1 });

  res.json(bids);
});

// ─── Get all bids ─────────────────────────────────────
// @route   GET /api/bids
// @access  Admin
const getAllBids = asyncHandler(async (req, res) => {
  const bids = await Bid.find({})
    .populate('bidder',  'name email')
    .populate('auction', 'title currentBid status category')
    .sort({ createdAt: -1 });

  res.json(bids);
});

// ─── Reject a bid ─────────────────────────────────────
// @route   PATCH /api/bids/:id/reject
// @access  Admin
const rejectBid = asyncHandler(async (req, res) => {
  const bid = await Bid.findById(req.params.id);

  if (!bid) {
    res.status(404);
    throw new Error('Bid not found');
  }

  if (bid.status === 'rejected') {
    res.status(400);
    throw new Error('This bid has already been rejected');
  }

  if (bid.status === 'won') {
    res.status(400);
    throw new Error('Cannot reject a winning bid');
  }

  bid.status = 'rejected';
  await bid.save();

  res.json({
    success: true,
    message: 'Bid rejected successfully',
    bid,
  });
});

module.exports = {
  placeBid,
  getBidsByAuction,
  getMyBids,
  getAllBids,
  rejectBid,
};