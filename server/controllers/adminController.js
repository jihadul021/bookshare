const User = require('../models/User');
const Book = require('../models/Book');
const Order = require('../models/Order');
const Message = require('../models/Message');

const normalizeLegacyCardPaymentStatus = (order) => {
  if (
    order &&
    order.orderType === 'purchase' &&
    order.paymentMethod === 'card' &&
    order.paymentStatus === 'pending'
  ) {
    order.paymentStatus = 'completed';
  }

  return order;
};

// Get all users (with pagination and search)
exports.getAllUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalUsers: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single user profile with orders
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's buying orders
    const buyingOrders = await Order.find({ user: userId })
      .populate('items.book', 'title price')
      .sort({ createdAt: -1 });

    // Get user's selling orders
    const sellingOrders = await Order.find({ 'sellers.sellerId': userId })
      .populate('items.book', 'title price')
      .sort({ createdAt: -1 });

    // Get user's books if they are a seller
    const userBooks = await Book.find({ seller: userId });

    res.status(200).json({
      success: true,
      user,
      buyingOrders,
      sellingOrders,
      totalBooks: userBooks.length,
      userBooks
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Disable user account (cascading deletion)
exports.disableUserAccount = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Mark user as disabled
    user.isDisabled = true;
    await user.save();

    // Disable all their books
    await Book.updateMany({ seller: userId }, { isAvailable: false });

    // Cancel all pending/confirmed orders where user is seller
    await Order.updateMany(
      { 'sellers.sellerId': userId, 'sellers.status': { $in: ['pending', 'confirmed', 'processing'] } },
      { $set: { 'sellers.$.status': 'cancelled' } }
    );

    // Cancel all the user's buying orders if pending
    await Order.updateMany(
      { user: userId, status: { $in: ['pending', 'confirmed'] } },
      { status: 'cancelled' }
    );

    res.status(200).json({
      success: true,
      message: `User account disabled and all associated data has been updated`,
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Enable user account
exports.enableUserAccount = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isDisabled = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User account enabled',
      user
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all books with sales information
exports.getAllBooksWithStats = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    const books = await Book.find(query)
      .populate('seller', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Get sales info for each book
    const booksWithStats = await Promise.all(
      books.map(async (book) => {
        const salesData = await Order.aggregate([
          { $unwind: '$items' },
          { $match: { 'items.book': book._id } },
          { $group: { _id: null, totalSold: { $sum: '$items.quantity' } } }
        ]);

        return {
          ...book.toObject(),
          totalSold: salesData[0]?.totalSold || 0,
          isAvailable: book.isAvailable && book.stock > 0
        };
      })
    );

    const total = await Book.countDocuments(query);

    res.status(200).json({
      success: true,
      books: booksWithStats,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalBooks: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete any book as admin
exports.deleteBookByAdmin = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    await book.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Book removed successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's order details (both buying and selling)
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get buying orders
    const buyingOrders = await Order.find({ user: userId })
      .populate('items.book', 'title price')
      .populate('sellers.sellerId', 'name email')
      .sort({ createdAt: -1 });

    // Get selling orders
    const sellingOrders = await Order.find({ 'sellers.sellerId': userId })
      .populate('items.book', 'title price')
      .populate('user', 'name email address phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      buyingOrders,
      sellingOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get seller profile and message history
exports.getSellerProfile = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const seller = await User.findById(sellerId).select('-password');
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Get seller's books
    const books = await Book.find({ seller: sellerId });

    // Get messages between admin and seller
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: sellerId },
        { sender: sellerId, receiver: req.user.id }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      seller,
      booksCount: books.length,
      books,
      recentMessages: messages.reverse()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders with full details for admin
exports.getAllOrders = async (req, res) => {
  try {
    const { search } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate({
        path: 'items.book',
        select: 'title author price images stock seller',
        populate: {
          path: 'seller',
          select: 'name email'
        }
      })
      .populate('user', 'name email phone')
      .populate('sellers.sellerId', 'name email')
      .populate('statusHistory.changedBy', 'name email role')
      .sort({ createdAt: -1 });

    orders.forEach(normalizeLegacyCardPaymentStatus);

    res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDisabledUsers = await User.countDocuments({ isDisabled: true });
    const totalBooks = await Book.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Calculate total revenue - handle cases where items might not exist
    let totalRevenue = 0;
    try {
      const revenueResult = await Order.aggregate([
        { $match: { items: { $exists: true, $ne: [] } } },
        { $unwind: '$items' },
        { $group: { _id: null, total: { $sum: '$items.price' } } }
      ]);
      totalRevenue = revenueResult[0]?.total || 0;
    } catch (err) {
      console.log('Revenue calculation error:', err.message);
      totalRevenue = 0;
    }

    const stats = {
      totalUsers,
      disabledUsers: totalDisabledUsers,
      activeUsers: totalUsers - totalDisabledUsers,
      totalBooks,
      totalOrders,
      totalRevenue
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: error.message });
  }
};
