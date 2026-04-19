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

// Public routes
router.get('/active', getActiveCoupons);

// Admin routes
router.post('/create', authMiddleware, createCoupon);
router.get('/all', authMiddleware, getAllCoupons);
router.get('/:id', authMiddleware, getCouponById);
router.put('/:id', authMiddleware, updateCoupon);
router.delete('/:id', authMiddleware, deleteCoupon);

module.exports = router;
