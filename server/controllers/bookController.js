const Book = require('../models/Book');
const Order = require('../models/Order');

exports.addBook = async (req, res) => {
  try {
    // Prevent disabled users from adding books
    if (req.user.isDisabled) {
      return res.status(403).json({ message: 'Your account is disabled' });
    }

    const { title, author, description, price, condition, category, images, exchangeAvailable, location } = req.body;

    // Process images: handle both file uploads and base64 images from request body
    let processedImages = [];
    
    // If files were uploaded via multer
    if (req.files && req.files.length > 0) {
      processedImages = req.files.map(file => `/uploads/${file.filename}`);
    } 
    // If images were sent as base64 strings in body
    else if (images && typeof images === 'string') {
      processedImages = [images];
    } 
    else if (Array.isArray(images)) {
      processedImages = images.filter(img => img);
    }

    const book = await Book.create({
      title,
      author,
      description,
      price,
      condition,
      category,
      images: processedImages,
      exchangeAvailable,
      location,
      seller: req.user._id
    });

    res.status(201).json(book);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// GET /api/books (with pagination and category filtering)
exports.getBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const skip = (page - 1) * limit;

    // Build query filter - show available books regardless of stock
    const filter = { isAvailable: true };
    if (category && category !== 'all') {
      filter.category = { $regex: category, $options: 'i' };
    }

    // Exclude books from disabled sellers
    const User = require('../models/User');
    const disabledUsers = await User.find({ isDisabled: true }).select('_id');
    const disabledUserIds = disabledUsers.map(u => u._id);
    if (disabledUserIds.length > 0) {
      filter.seller = { $nin: disabledUserIds };
    }

    const books = await Book.find(filter)
      .populate('seller', 'name email profilePicture isverified phone')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(filter);

    res.json({
      books,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBooks: total,
        hasMore: skip + limit < total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/books/:id
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('seller', 'name email profilePicture isverified phone address');
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addBookReview = async (req, res) => {
  try {
    const { rating, comment = '' } = req.body;
    const numericRating = Number(rating);

    if (!numericRating || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const purchasedOrders = await Order.find({
      user: req.user._id,
      orderType: 'purchase',
      status: { $ne: 'cancelled' }
    }).select('status items sellers deliveredAt statusHistory');

    const hasReceivedBook = purchasedOrders.some((order) => {
      const hasBookInOrder = order.items?.some(
        (item) => item.book?.toString() === book._id.toString()
      );

      if (!hasBookInOrder) {
        return false;
      }

      if (order.status === 'delivered' || order.deliveredAt) {
        return true;
      }

      return order.sellers?.some((sellerEntry) => {
        const sellerDelivered = sellerEntry.status === 'delivered';
        const sellerHasBook = sellerEntry.items?.some(
          (itemId) => itemId?.toString() === book._id.toString()
        );

        return sellerDelivered && sellerHasBook;
      });
    });

    if (!hasReceivedBook) {
      return res.status(403).json({ message: 'You can only review books you have received' });
    }

    const existingReview = book.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      existingReview.rating = numericRating;
      existingReview.comment = comment.trim();
      existingReview.name = req.user.name;
    } else {
      book.reviews.push({
        user: req.user._id,
        name: req.user.name,
        rating: numericRating,
        comment: comment.trim()
      });
    }

    book.numReviews = book.reviews.length;
    book.rating =
      book.reviews.reduce((sum, review) => sum + review.rating, 0) /
      Math.max(book.reviews.length, 1);

    await book.save();

    res.status(201).json({
      success: true,
      message: existingReview ? 'Review updated successfully' : 'Review added successfully',
      review: book.reviews.find((review) => review.user.toString() === req.user._id.toString()),
      rating: book.rating,
      numReviews: book.numReviews
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/books/mybooks
exports.getMyBooks = async (req, res) => {
  try {
    // Check if user is disabled
    if (req.user.isDisabled) {
      return res.status(403).json({ message: 'Your account is disabled' });
    }
    const books = await Book.find({ seller: req.user._id });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    // Prevent disabled users from updating books
    if (req.user.isDisabled) {
      return res.status(403).json({ message: 'Your account is disabled' });
    }
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.seller.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Process images if provided
    const updateData = { ...req.body };
    
    if (req.files && req.files.length > 0) {
      // If new files are uploaded, replace all images
      updateData.images = req.files.map(file => `/uploads/${file.filename}`);
    } else if (req.body.images) {
      // Keep existing or use provided images (base64 or mixed)
      if (typeof req.body.images === 'string') {
        updateData.images = [req.body.images];
      } else if (Array.isArray(req.body.images)) {
        updateData.images = req.body.images.filter(img => img);
      }
    }

    const updated = await Book.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/books/:id
exports.deleteBook = async (req, res) => {
  try {
    // Prevent disabled users from deleting books
    if (req.user.isDisabled) {
      return res.status(403).json({ message: 'Your account is disabled' });
    }
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.seller.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await book.deleteOne();
    res.json({ message: 'Book removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search books with advanced filtering
exports.searchBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { isAvailable: true, stock: { $gt: 0 } };

    // Search by title or author
    if (req.query.query) {
      filter.$or = [
        { title: { $regex: req.query.query, $options: 'i' } },
        { author: { $regex: req.query.query, $options: 'i' } }
      ];
    }

    // Filter by category
    const rawCategories = req.query.category || req.query['category[]'];
    if (rawCategories) {
      const categories = Array.isArray(rawCategories)
        ? rawCategories
        : String(rawCategories).split(',');
      
      const validCategories = categories.filter(cat => cat && cat !== 'all');
      if (validCategories.length > 0) {
        // Match if book's category array contains any of the selected categories
        filter.category = { 
          $in: validCategories.map(cat => new RegExp(cat, 'i'))
        };
      }
    }

    // Filter by condition
    const rawConditions = req.query.condition || req.query['condition[]'];
    if (rawConditions) {
      const conditions = Array.isArray(rawConditions)
        ? rawConditions
        : String(rawConditions).split(',');
      
      // Map condition values and handle "fair and better" case
      const conditionValues = [];
      const conditionOrder = ['new', 'like new', 'good', 'fair', 'poor'];
      const uniqueConditions = [...new Set(conditions)]; // Remove duplicates
      
      uniqueConditions.forEach(cond => {
        if (cond === 'fair') {
          // Include fair and all better conditions (new, like new, good, fair)
          const index = conditionOrder.indexOf('fair');
          for (let i = 0; i <= index; i++) {
            conditionValues.push(conditionOrder[i]);
          }
        } else {
          conditionValues.push(cond);
        }
      });
      
      // Remove duplicates from conditionValues
      filter.condition = { $in: [...new Set(conditionValues)] };
    }

    // Filter by location
    if (req.query.location) {
      filter.location = { $regex: req.query.location, $options: 'i' };
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) {
        filter.price.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filter.price.$lte = parseFloat(req.query.maxPrice);
      }
    }

    // Filter by minimum rating
    if (req.query.minRating) {
      filter.rating = { $gte: parseFloat(req.query.minRating) };
    }

    // Determine sort order
    let sort = { createdAt: -1 };
    if (req.query.sortBy) {
      if (req.query.sortBy === 'price-asc') {
        sort = { price: 1 };
      } else if (req.query.sortBy === 'price-desc') {
        sort = { price: -1 };
      } else if (req.query.sortBy === 'rating') {
        sort = { rating: -1 };
      } else if (req.query.sortBy === 'newest') {
        sort = { createdAt: -1 };
      }
    }

    const books = await Book.find(filter)
      .populate('seller', 'name email profilePicture isverified phone')
      .skip(skip)
      .limit(limit)
      .sort(sort);

    const total = await Book.countDocuments(filter);

    res.json({
      books,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBooks: total,
        hasMore: skip + limit < total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get books by seller
exports.getSellerBooks = async (req, res) => {
  try {
    const sellerId = req.params.sellerId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const books = await Book.find({ seller: sellerId, isAvailable: true, stock: { $gt: 0 } })
      .populate('seller', 'name email profilePicture isverified phone address')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments({ seller: sellerId, isAvailable: true, stock: { $gt: 0 } });

    res.json({
      books,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalBooks: total,
        hasMore: skip + limit < total
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
