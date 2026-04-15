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

// GET /api/books
exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find({ isAvailable: true }).populate('seller', 'name email profilePicture');
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/books/:id
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('seller', 'name email profilePicture');
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