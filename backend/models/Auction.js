const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    images: [{ type: String }],
    category: {
      type: String,
      required: true,
    },
    startingBid: {
      type: Number,
      required: [true, 'Starting bid is required'],
      min: 0,
    },
    currentBid: {
      type: Number,
      default: 0,
    },
    highestBidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Track if listed by seller or admin
    listedBy: {
      type: String,
      enum: ['admin', 'seller'],
      default: 'admin',
    },
    // Approval flow for seller listings
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved', // admin listings auto-approved
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'upcoming', 'live', 'ended', 'cancelled'],
      default: 'upcoming',
    },
    totalBids: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Auction', auctionSchema);