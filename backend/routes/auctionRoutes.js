const express = require('express');
const router  = express.Router();

const {
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
} = require('../controllers/auctionController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

// ─── Public ───────────────────────────────────────────
router.get('/',   getAuctions);
router.post('/',  protect, adminOnly, createAuction);

// ─── Admin only ───────────────────────────────────────
router.get('/admin/all',     protect, adminOnly, getAllAuctionsAdmin);
router.get('/admin/pending', protect, adminOnly, getPendingListings);

// ─── Single auction ───────────────────────────────────
router.get('/:id',                      getAuctionById);
router.put('/:id',                      protect, adminOnly, updateAuction);
router.delete('/:id',                   protect, adminOnly, deleteAuction);
router.patch('/:id/status',             protect, adminOnly, updateAuctionStatus);
router.patch('/:id/approve',            protect, adminOnly, approveListing);
router.patch('/:id/reject-listing',     protect, adminOnly, rejectListing);

module.exports = router;