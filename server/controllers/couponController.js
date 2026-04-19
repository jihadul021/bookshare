const Coupon = require('../models/Coupon');

// Create coupon (admin only)
exports.createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, description, maxUses, minOrderAmount, maxDiscount, validUntil } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ message: 'Coupon code already exists' });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType: discountType || 'percentage',
      discountValue,
      description,
      maxUses: maxUses || null,
      minOrderAmount: minOrderAmount || 0,
      maxDiscount: maxDiscount || null,
      validUntil: new Date(validUntil),
      createdBy: req.user.id
    });

    await coupon.save();

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all coupons (admin only)
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      coupons
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get coupon by ID (admin only)
exports.getCouponById = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id)
      .populate('createdBy', 'name email')
      .populate('usedBy.user', 'name email');

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.status(200).json({
      success: true,
      coupon
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update coupon (admin only)
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { discountType, discountValue, description, maxUses, minOrderAmount, maxDiscount, validUntil, isActive } = req.body;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    if (discountType) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = discountValue;
    if (description) coupon.description = description;
    if (maxUses !== undefined) coupon.maxUses = maxUses;
    if (minOrderAmount !== undefined) coupon.minOrderAmount = minOrderAmount;
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount;
    if (validUntil) coupon.validUntil = new Date(validUntil);
    if (isActive !== undefined) coupon.isActive = isActive;

    await coupon.save();

    res.status(200).json({
      success: true,
      message: 'Coupon updated successfully',
      coupon
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete coupon (admin only)
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully'
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active coupons (for users to see available coupons)
exports.getActiveCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    }).select('code description discountType discountValue minOrderAmount');

    res.status(200).json({
      success: true,
      coupons
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
