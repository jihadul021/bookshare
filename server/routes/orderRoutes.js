const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  getUserOrders, 
  getOrderById, 
  cancelOrder, 
  getAllOrders, 
  updateOrderStatus, 
  getOrderStats,
  verifyCoupon,
  getSellerOrders,
  updateSellerOrderStatus
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

// Specific routes (must come first)
router.post('/create', authMiddleware, createOrder);
router.post('/verify-coupon', authMiddleware, verifyCoupon);
router.get('/my-orders', authMiddleware, getUserOrders);
router.get('/admin/all-orders', authMiddleware, getAllOrders);
router.get('/admin/stats', authMiddleware, getOrderStats);
router.get('/seller/orders', authMiddleware, getSellerOrders);

// Generic routes (must come last)
router.get('/:orderId', authMiddleware, getOrderById);
router.put('/:orderId/cancel', authMiddleware, cancelOrder);
router.put('/admin/:orderId/update-status', authMiddleware, updateOrderStatus);
router.put('/seller/:orderId/update-status', authMiddleware, updateSellerOrderStatus);

module.exports = router;
