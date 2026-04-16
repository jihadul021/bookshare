const Book = require('../models/Book');

exports.addBook = async (req, res) => {
  try {
    const { title, author, description, price, condition, category, images, exchangeAvailable, location } = req.body;

    const book = await Book.create({
      title,
      author,
      description,
      price,
      condition,
      category,
      images,
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

    // Build query filter
    const filter = { isAvailable: true };
    if (category && category !== 'all') {
      filter.category = { $regex: category, $options: 'i' };
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

// GET /api/books/mybooks
exports.getMyBooks = async (req, res) => {
  try {
    const books = await Book.find({ seller: req.user._id });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.seller.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const updated = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/books/:id
exports.deleteBook = async (req, res) => {
  try {
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