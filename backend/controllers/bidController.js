const asyncHandler = require('express-async-handler');
const Bid          = require('../models/Bid');
const Auction      = require('../models/Auction');

// @desc    Place a bid
// @route   POST /api/bids
// @access  Buyer
const placeBid = asyncHandler(async (req, res) => {
  const { auctionId, amount } = req.body;

  if (!auctionId || !amount) {
    res.status(400);
    throw new Error('Auction ID and bid amount are required');
  }

  const auction = await Auction.findById(auctionId);

  if (!auction) {
    res.status(404);
    throw new Error('Auction not found');
  }

  if (auction.status !== 'live') {
    res.status(400);
    throw new Error('Bidding is only allowed on live auctions');
  }

  if (amount <= auction.currentBid) {
    res.status(400);
    throw new Error(`Bid must be higher than current bid of $${auction.currentBid}`);
  }

  // Mark previous highest bid as outbid
  if (auction.highestBidder) {
    await Bid.findOneAndUpdate(
      { auction: auctionId, status: 'active' },
      { status: 'outbid' }
    );
  }

  // Create new bid
  const bid = await Bid.create({
    auction: auctionId,
    bidder:  req.user._id,
    amount,
    status:  'active',
  });

  // Update auction current bid
  auction.currentBid     = amount;
  auction.highestBidder  = req.user._id;
  auction.totalBids      += 1;
  await auction.save();

  const populated = await bid.populate('bidder', 'name email');

  res.status(201).json(populated);
});

// @desc    Get all bids for an auction
// @route   GET /api/bids/auction/:auctionId
// @access  Public
const getBidsByAuction = asyncHandler(async (req, res) => {
  const bids = await Bid.find({ auction: req.params.auctionId })
    .populate('bidder', 'name email')
    .sort({ amount: -1 });

  res.json(bids);
});

// @desc    Get bids by logged in user
// @route   GET /api/bids/my
// @access  Private
const getMyBids = asyncHandler(async (req, res) => {
  const bids = await Bid.find({ bidder: req.user._id })
    .populate('auction', 'title currentBid status endDate')
    .sort({ createdAt: -1 });

  res.json(bids);
});

// @desc    Get all bids (admin)
// @route   GET /api/bids
// @access  Admin
const getAllBids = asyncHandler(async (req, res) => {
  const bids = await Bid.find({})
    .populate('bidder', 'name email')
    .populate('auction', 'title currentBid status')
    .sort({ createdAt: -1 });

  res.json(bids);
});

// @desc    Reject a bid
// @route   PATCH /api/bids/:id/reject
// @access  Admin
const rejectBid = asyncHandler(async (req, res) => {
  const bid = await Bid.findById(req.params.id);

  if (!bid) {
    res.status(404);
    throw new Error('Bid not found');
  }

  bid.status = 'rejected';
  await bid.save();

  res.json({ message: 'Bid rejected', bid });
});

module.exports = {
  placeBid,
  getBidsByAuction,
  getMyBids,
  getAllBids,
  rejectBid,
};