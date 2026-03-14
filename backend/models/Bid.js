const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
  {
    auction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Auction',
      required: true,
    },
    bidder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Bid amount is required'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'outbid', 'won', 'rejected'],
      default: 'active',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bid', bidSchema);