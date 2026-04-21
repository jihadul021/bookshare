const express = require('express');
const router = express.Router();
const {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  getActiveCoupons
} = require('../controllers/couponController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public routes
router.get('/active', getActiveCoupons);

// Admin routes
router.post('/create', authMiddleware, adminMiddleware, createCoupon);
router.get('/all', authMiddleware, adminMiddleware, getAllCoupons);
router.get('/:id', authMiddleware, adminMiddleware, getCouponById);
router.put('/:id', authMiddleware, adminMiddleware, updateCoupon);
router.delete('/:id', authMiddleware, adminMiddleware, deleteCoupon);

module.exports = router;
