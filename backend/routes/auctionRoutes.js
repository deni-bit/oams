const express = require('express');
const router  = express.Router();

const {
  createAuction,
  getAuctions,
  getAuctionById,
  updateAuction,
  deleteAuction,
  updateAuctionStatus,
} = require('../controllers/auctionController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/',    getAuctions);
router.post('/',   protect, adminOnly, createAuction);

router.get('/:id',           getAuctionById);
router.put('/:id',           protect, adminOnly, updateAuction);
router.delete('/:id',        protect, adminOnly, deleteAuction);
router.patch('/:id/status',  protect, adminOnly, updateAuctionStatus);

module.exports = router;