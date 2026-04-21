const express = require('express');
const router = express.Router();
const { 
  createOrder, 
  createExchangeRequest,
  getUserOrders, 
  getOrderById, 
  cancelOrder, 
  getAllOrders, 
  updateOrderStatus, 
  getOrderStats,
  verifyCoupon,
  getSellerOrders,
  updateSellerOrderStatus,
  confirmExchangeCompletion
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const adminProtect = require('../middleware/adminMiddleware');

// Specific routes (must come first)
router.post('/create', authMiddleware, createOrder);
router.post('/exchange-request', authMiddleware, createExchangeRequest);
router.post('/verify-coupon', authMiddleware, verifyCoupon);
router.get('/my-orders', authMiddleware, getUserOrders);
router.get('/admin/all-orders', authMiddleware, adminProtect, getAllOrders);
router.get('/admin/stats', authMiddleware, adminProtect, getOrderStats);
router.get('/seller/orders', authMiddleware, getSellerOrders);

// Generic routes (must come last)
router.get('/:orderId', authMiddleware, getOrderById);
router.put('/:orderId/cancel', authMiddleware, cancelOrder);
router.put('/:orderId/exchange-confirm', authMiddleware, confirmExchangeCompletion);
router.put('/admin/:orderId/update-status', authMiddleware, adminProtect, updateOrderStatus);
router.put('/seller/:orderId/update-status', authMiddleware, updateSellerOrderStatus);

module.exports = router;
