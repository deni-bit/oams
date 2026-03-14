const express = require('express');
const router  = express.Router();

const {
  placeBid,
  getBidsByAuction,
  getMyBids,
  getAllBids,
  rejectBid,
} = require('../controllers/bidController');

const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/',                        protect, adminOnly, getAllBids);
router.post('/',                       protect, placeBid);
router.get('/my',                      protect, getMyBids);
router.get('/auction/:auctionId',      getBidsByAuction);
router.patch('/:id/reject',            protect, adminOnly, rejectBid);

module.exports = router;