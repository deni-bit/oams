const asyncHandler = require('express-async-handler');
const Bid          = require('../models/Bid');
const Auction      = require('../models/Auction');

// ─── Place a bid ──────────────────────────────────────
// @route   POST /api/bids
// @access  Buyer
const placeBid = asyncHandler(async (req, res) => {
  const { auctionId, amount } = req.body;

  if (!auctionId || amount === undefined || amount === null) {
    res.status(400);
    throw new Error('Auction ID and bid amount are required');
  }

  const bidAmount = parseFloat(amount);
  if (isNaN(bidAmount) || bidAmount <= 0) {
    res.status(400);
    throw new Error('Bid amount must be a positive number');
  }

  if (bidAmount > 100_000_000) {
    res.status(400);
    throw new Error('Bid amount exceeds maximum allowed value of $100,000,000');
  }

  const auction = await Auction.findById(auctionId);
  if (!auction) {
    res.status(404);
    throw new Error('Auction not found');
  }

  if (auction.status !== 'live') {
    res.status(400);
    throw new Error(
      auction.status === 'upcoming' ? 'This auction has not started yet'
      : auction.status === 'ended'  ? 'This auction has already ended'
      : 'Bidding is not allowed on this auction'
    );
  }

  if (auction.createdBy.toString() === req.user._id.toString()) {
    res.status(403);
    throw new Error('You cannot bid on your own auction');
  }

  if (
    auction.highestBidder &&
    auction.highestBidder.toString() === req.user._id.toString()
  ) {
    res.status(400);
    throw new Error('You are already the highest bidder on this auction');
  }

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

  // Create new bid
  const bid = await Bid.create({
    auction: auctionId,
    bidder:  req.user._id,
    amount:  bidAmount,
    status:  'active',
  });

  // Update auction
  auction.currentBid    = bidAmount;
  auction.highestBidder = req.user._id;
  auction.totalBids    += 1;
  await auction.save();

  const populated = await bid.populate('bidder', 'name email');

  // ─────────────────────────────────────────
  // REAL-TIME BROADCAST via WebSocket
  // Emit to everyone watching this auction room
  // ─────────────────────────────────────────
  const io = req.app.get('io');
  if (io) {
    io.to(auctionId).emit('bid_placed', {
      auctionId,
      newBid: {
        _id:       bid._id,
        amount:    bidAmount,
        bidder:    { name: req.user.name, email: req.user.email },
        status:    'active',
        createdAt: bid.createdAt,
      },
      currentBid:    bidAmount,
      totalBids:     auction.totalBids,
      highestBidder: { name: req.user.name, email: req.user.email },
    });
    console.log(`[WS] Broadcast bid_placed to auction room: ${auctionId}`);
  }

  res.status(201).json(populated);
});