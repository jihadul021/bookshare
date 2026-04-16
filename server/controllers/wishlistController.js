const Wishlist = require('../models/Wishlist');
const Book = require('../models/Book');

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('books.book');

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        books: []
      });
    }

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { bookId } = req.body;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user._id,
        books: []
      });
    }

    // Check if book already in wishlist
    const bookExists = wishlist.books.some(item => item.book.toString() === bookId);

    if (bookExists) {
      return res.status(409).json({ message: 'Book already in wishlist' });
    }

    wishlist.books.push({ book: bookId });

    await wishlist.save();
    await wishlist.populate('books.book');

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { bookId } = req.body;

    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) return res.status(404).json({ message: 'Wishlist not found' });

    wishlist.books = wishlist.books.filter(item => item.book.toString() !== bookId);

    await wishlist.save();
    await wishlist.populate('books.book');

    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add wishlist items to cart
exports.addWishlistToCart = async (req, res) => {
  try {
    const { bookIds } = req.body; // Array of book IDs from wishlist

    const Cart = require('../models/Cart');
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: []
      });
    }

    let totalPrice = 0;

    for (let bookId of bookIds) {
      const itemIndex = cart.items.findIndex(item => item.book.toString() === bookId);

      if (itemIndex === -1) {
        cart.items.push({
          book: bookId,
          quantity: 1
        });
      }

      const book = await Book.findById(bookId);
      totalPrice += book.price;
    }

    // Recalculate total price
    for (let item of cart.items) {
      const book = await Book.findById(item.book);
      totalPrice += book.price * (item.quantity - 1);
    }

    cart.totalPrice = totalPrice;
    cart.totalItems = cart.items.length;

    await cart.save();
    await cart.populate('items.book');

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
