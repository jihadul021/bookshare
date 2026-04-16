const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  addWishlistToCart
} = require('../controllers/wishlistController');

router.get('/', protect, getWishlist);
router.post('/add', protect, addToWishlist);
router.post('/remove', protect, removeFromWishlist);
router.post('/add-to-cart', protect, addWishlistToCart);

module.exports = router;
