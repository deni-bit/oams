const express = require('express');
const router  = express.Router();

const {
  getSellerDashboard,
  getMyListings,
  createListing,
  updateListing,
  deleteListing,
  getListingBids,
  updateSellerProfile,
} = require('../controllers/sellerController');

const { protect, sellerOnly } = require('../middleware/authMiddleware');

router.get('/dashboard',           protect, sellerOnly, getSellerDashboard);
router.get('/listings',            protect, sellerOnly, getMyListings);
router.post('/listings',           protect, sellerOnly, createListing);
router.put('/listings/:id',        protect, sellerOnly, updateListing);
router.delete('/listings/:id',     protect, sellerOnly, deleteListing);
router.get('/listings/:id/bids',   protect, sellerOnly, getListingBids);
router.put('/profile',             protect, sellerOnly, updateSellerProfile);

module.exports = router;