const asyncHandler = require('express-async-handler');
const Auction      = require('../models/Auction');
const Bid          = require('../models/Bid');

// @desc    Create a new auction
// @route   POST /api/auctions
// @access  Admin
const createAuction = asyncHandler(async (req, res) => {
  const { title, description, category, startingBid, startDate, endDate, images } = req.body;

  if (!title || !description || !category || !startingBid || !startDate || !endDate) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }

  const auction = await Auction.create({
    title,
    description,
    category,
    startingBid,
    currentBid: startingBid,
    startDate,
    endDate,
    images: images || [],
    createdBy: req.user._id,
    status: new Date(startDate) > new Date() ? 'upcoming' : 'live',
  });

  res.status(201).json(auction);
});

// @desc    Get all auctions
// @route   GET /api/auctions
// @access  Public
const getAuctions = asyncHandler(async (req, res) => {
  const { status, category, search } = req.query;

  const filter = {};
  if (status)   filter.status   = status;
  if (category) filter.category = category;
  if (search)   filter.title    = { $regex: search, $options: 'i' };

  const auctions = await Auction.find(filter)
    .populate('createdBy', 'name email')
    .populate('highestBidder', 'name email')
    .sort({ createdAt: -1 });

  res.json(auctions);
});

// @desc    Get single auction
// @route   GET /api/auctions/:id
// @access  Public
const getAuctionById = asyncHandler(async (req, res) => {
  const auction = await Auction.findById(req.params.id)
    .populate('createdBy', 'name email')
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

  const updated = await Auction.findByIdAndUpdate(
    req.params.id,
    req.body,
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

  await Bid.deleteMany({ auction: req.params.id });
  await auction.deleteOne();

  res.json({ message: 'Auction and all related bids removed' });
});

// @desc    Update auction status
// @route   PATCH /api/auctions/:id/status
// @access  Admin
const updateAuctionStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validStatuses = ['upcoming', 'live', 'ended', 'cancelled'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Invalid status value');
  }

  const auction = await Auction.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!auction) {
    res.status(404);
    throw new Error('Auction not found');
  }

  res.json(auction);
});

module.exports = {
  createAuction,
  getAuctions,
  getAuctionById,
  updateAuction,
  deleteAuction,
  updateAuctionStatus,
};