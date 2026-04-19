const Order = require('../models/Order');
const Coupon = require('../models/Coupon');
const Book = require('../models/Book');
const Cart = require('../models/Cart');
const Address = require('../models/Address');
const User = require('../models/User');

// Helper function to generate unique order number
const generateOrderNumber = async () => {
  try {
    const count = await Order.countDocuments();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${timestamp}-${random.padEnd(6, '0')}`;
  } catch (error) {
    // Fallback if count fails
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
    return `ORD-${timestamp}-${random}`;
  }
};

// Create a new order from cart
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, couponCode, paymentMethod } = req.body;
    const userId = req.user._id;

    console.log('Creating order for user:', userId);
    console.log('Order items:', items);
    console.log('Shipping address:', shippingAddress);

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain items' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    // Validate stock for all items
    let subtotal = 0;
    const orderItems = [];
    const sellersMap = {}; // Track items by seller

    for (const item of items) {
      const book = await Book.findById(item.bookId);
      if (!book) {
        return res.status(400).json({ message: `Book ${item.bookId} not found` });
      }

      if (book.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${book.title}. Available: ${book.stock}` 
        });
      }

      orderItems.push({
        book: book._id,
        quantity: item.quantity,
        price: book.price
      });

      // Track by seller
      const sellerId = book.seller.toString();
      if (!sellersMap[sellerId]) {
        const seller = await User.findById(sellerId).select('name');
        sellersMap[sellerId] = {
          sellerId: book.seller,
          sellerName: seller?.name || 'Unknown Seller',
          items: []
        };
      }
      sellersMap[sellerId].items.push(book._id);

      subtotal += book.price * item.quantity;
    }

    // Apply coupon if provided
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ 
        code: couponCode.toUpperCase(),
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() }
      });

      if (!coupon) {
        return res.status(400).json({ message: 'Invalid or expired coupon' });
      }

      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return res.status(400).json({ message: 'Coupon has reached maximum uses' });
      }

      if (subtotal < coupon.minOrderAmount) {
        return res.status(400).json({ 
          message: `Minimum order amount for this coupon is ${coupon.minOrderAmount}` 
        });
      }

      if (coupon.discountType === 'percentage') {
        discountAmount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount) {
          discountAmount = Math.min(discountAmount, coupon.maxDiscount);
        }
      } else {
        discountAmount = coupon.discountValue;
      }
    }

    const totalAmount = subtotal - discountAmount;

    // Validate sellers map is not empty
    const sellers = Object.values(sellersMap);
    if (sellers.length === 0) {
      return res.status(400).json({ message: 'No valid sellers found for books' });
    }

    // Generate unique order number
    const orderNumber = await generateOrderNumber();

    // Create order
    const order = new Order({
      orderNumber,
      user: userId,
      items: orderItems,
      sellers: sellers,
      shippingAddress,
      subtotal,
      coupon: couponCode ? {
        code: couponCode.toUpperCase(),
        discountAmount
      } : null,
      shippingCost: 0,
      totalAmount,
      paymentMethod: paymentMethod || 'cash_on_delivery',
      status: 'pending'
    });

    // Add to status history
    order.statusHistory.push({
      status: 'pending',
      changedAt: new Date(),
      changedBy: userId,
      reason: 'Order created'
    });

    await order.save();

    await order.populate([
      {
        path: 'items.book',
        select: 'title author images price'
      },
      {
        path: 'sellers.sellerId',
        select: 'name'
      },
      {
        path: 'user',
        select: 'name email phone'
      }
    ]);

    console.log('Order saved successfully:', order._id);

    // Update coupon usage if applied
    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode.toUpperCase() },
        {
          $inc: { usedCount: 1 },
          $push: { usedBy: { user: userId, usedAt: new Date() } }
        }
      );
      console.log('Coupon usage updated');
    }

    // Clear cart
    await Cart.findOneAndUpdate({ user: userId }, { items: [], totalPrice: 0, totalItems: 0 });

    console.log('Cart cleared');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });

  } catch (error) {
    console.error('Order creation error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ message: `Order creation failed: ${error.message}` });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ user: userId })
      .populate('items.book')
      .populate('sellers.sellerId', 'name')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order details by ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findById(orderId)
      .populate('items.book')
      .populate('sellers.sellerId', 'name')
      .populate('user')
      .populate('statusHistory.changedBy', 'name');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.status(200).json({
      success: true,
      order
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel order (only if status is 'pending' or 'confirmed')
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Only allow cancellation if status is pending or confirmed
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ 
        message: `Cannot cancel order with status ${order.status}` 
      });
    }

    // Update order status
    order.status = 'cancelled';
    order.cancellationReason = reason || 'Cancelled by user';
    order.cancelledAt = new Date();
    order.cancelledBy = userId;

    // Add to status history
    order.statusHistory.push({
      status: 'cancelled',
      changedAt: new Date(),
      changedBy: userId,
      reason: reason || 'Cancelled by user'
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('items.book')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, reason } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const currentStatus = order.status;

    // Validate status transitions
    if (currentStatus === 'processing' && status === 'cancelled') {
      return res.status(400).json({ 
        message: 'Cannot cancel order that is already being processed' 
      });
    }

    if (currentStatus === 'delivered') {
      return res.status(400).json({ 
        message: 'Cannot change status of a delivered order' 
      });
    }

    if (currentStatus === 'cancelled') {
      return res.status(400).json({ 
        message: 'Cannot change status of a cancelled order' 
      });
    }

    // If changing to 'processing' or 'delivered', update stock
    if (status === 'processing' && currentStatus !== 'processing') {
      // Reduce stock when order moves to processing
      for (const item of order.items) {
        await Book.findByIdAndUpdate(
          item.book,
          { $inc: { stock: -item.quantity } }
        );
      }
    }

    if (status === 'cancelled') {
      order.cancellationReason = reason || 'Cancelled by admin';
      order.cancelledAt = new Date();
      order.cancelledBy = req.user._id;
    }

    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    order.status = status;
    order.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user._id,
      reason: reason || `Status changed to ${status}`
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get order statistics (admin)
exports.getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      ordersByStatus
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verify coupon
exports.verifyCoupon = async (req, res) => {
  try {
    const { code, amount } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    });

    if (!coupon) {
      return res.status(400).json({ message: 'Invalid or expired coupon' });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return res.status(400).json({ message: 'Coupon has reached maximum uses' });
    }

    if (amount < coupon.minOrderAmount) {
      return res.status(400).json({ 
        message: `Minimum order amount for this coupon is ${coupon.minOrderAmount}` 
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (amount * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    res.status(200).json({
      success: true,
      message: 'Coupon is valid',
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        description: coupon.description
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Seller: Get their orders
exports.getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // Find all orders that contain books from this seller
    const orders = await Order.find({
      'sellers.sellerId': sellerId
    })
      .populate('items.book')
      .populate('user', 'name email phone address')
      .populate('sellers.sellerId', 'name')
      .sort({ createdAt: -1 });

    // Filter items to only show items from this seller
    const sellerOrders = orders.map(order => {
      const sellerData = order.sellers.find(s => s.sellerId._id.toString() === sellerId.toString());
      return {
        _id: order._id,
        orderId: order._id,
        items: order.items.filter(item => 
          sellerData.items.some(si => si.toString() === item.book._id.toString())
        ),
        user: order.user,
        status: order.status,
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
        statusHistory: order.statusHistory,
        sellerData: sellerData
      };
    });

    res.status(200).json({
      success: true,
      orders: sellerOrders
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Seller: Update order status for their items
exports.updateSellerOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, reason } = req.body;
    const sellerId = req.user._id;

    const validStatuses = ['pending', 'confirmed', 'processing', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if seller is part of this order
    const sellerInOrder = order.sellers.find(s => 
      s.sellerId.toString() === sellerId.toString()
    );

    if (!sellerInOrder) {
      return res.status(403).json({ message: 'Unauthorized - Seller not part of this order' });
    }

    const currentStatus = order.status;

    // Validate status transitions
    if (currentStatus === 'delivered') {
      return res.status(400).json({ 
        message: 'Cannot change status of a delivered order' 
      });
    }

    if (currentStatus === 'cancelled') {
      return res.status(400).json({ 
        message: 'Cannot change status of a cancelled order' 
      });
    }

    // If changing to 'processing', decrease stock for seller's items
    if (status === 'processing' && currentStatus !== 'processing') {
      for (const itemId of sellerInOrder.items) {
        const item = order.items.find(i => i.book.toString() === itemId.toString());
        if (item) {
          await Book.findByIdAndUpdate(
            item.book,
            { $inc: { stock: -item.quantity } }
          );
        }
      }
    }

    // Update seller's item status in the order
    if (!sellerInOrder.statusHistory) {
      sellerInOrder.statusHistory = [];
    }

    sellerInOrder.status = status;
    sellerInOrder.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: sellerId,
      reason: reason || `Status changed to ${status}`
    });

    // If all sellers have marked as delivered, mark order as delivered
    if (status === 'delivered') {
      let allSellersSent = true;
      for (const seller of order.sellers) {
        if (seller.status !== 'delivered' && seller.sellerId.toString() !== sellerId.toString()) {
          allSellersSent = false;
          break;
        }
      }

      if (allSellersSent) {
        order.status = 'delivered';
        order.deliveredAt = new Date();
        order.statusHistory.push({
          status: 'delivered',
          changedAt: new Date(),
          changedBy: sellerId,
          reason: 'All sellers have shipped items'
        });
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Seller order status updated successfully',
      order
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
