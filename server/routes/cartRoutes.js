const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart
} = require('../controllers/cartController');

router.get('/', protect, getCart);
router.post('/add', protect, addToCart);
router.post('/remove', protect, removeFromCart);
router.put('/update', protect, updateCartItemQuantity);
router.post('/clear', protect, clearCart);

module.exports = router;
