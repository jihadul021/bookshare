const Cart = require('../models/Cart');
const Book = require('../models/Book');

// Get user's cart
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.book');
    
    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
        totalPrice: 0,
        totalItems: 0
      });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add to cart
exports.addToCart = async (req, res) => {
  try {
    // Prevent admin and disabled users from adding to cart
    if (req.user.role === 'admin') {
      return res.status(403).json({ message: 'Admins cannot place orders' });
    }
    if (req.user.isDisabled) {
      return res.status(403).json({ message: 'Your account is disabled' });
    }

    const { bookId, quantity = 1 } = req.body;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // Check stock
    if (book.stock <= 0) {
      return res.status(400).json({ message: 'Book is out of stock' });
    }

    if (book.stock < quantity) {
      return res.status(400).json({ 
        message: `Insufficient stock. Available: ${book.stock}` 
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: []
      });
    }

    // Check if book already in cart
    const itemIndex = cart.items.findIndex(item => item.book.toString() === bookId);

    if (itemIndex > -1) {
      // Check if total quantity will exceed stock
      const newQuantity = cart.items[itemIndex].quantity + parseInt(quantity);
      if (newQuantity > book.stock) {
        return res.status(400).json({ 
          message: `Insufficient stock. Available: ${book.stock}` 
        });
      }
      cart.items[itemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({
        book: bookId,
        quantity: parseInt(quantity)
      });
    }

    // Calculate totals
    let totalPrice = 0;
    for (let item of cart.items) {
      const itemBook = await Book.findById(item.book);
      totalPrice += itemBook.price * item.quantity;
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

// Remove from cart
exports.removeFromCart = async (req, res) => {
  try {
    const { bookId } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => item.book.toString() !== bookId);

    // Recalculate totals
    let totalPrice = 0;
    for (let item of cart.items) {
      const book = await Book.findById(item.book);
      totalPrice += book.price * item.quantity;
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

// Update cart item quantity
exports.updateCartItemQuantity = async (req, res) => {
  try {
    const { bookId, quantity } = req.body;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const itemIndex = cart.items.findIndex(item => item.book.toString() === bookId);

    if (itemIndex === -1) return res.status(404).json({ message: 'Item not in cart' });

    // Check stock if quantity is being increased
    if (quantity > 0) {
      const book = await Book.findById(bookId);
      if (book.stock < quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock. Available: ${book.stock}` 
        });
      }
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = parseInt(quantity);
    }

    // Recalculate totals
    let totalPrice = 0;
    for (let item of cart.items) {
      const book = await Book.findById(item.book);
      totalPrice += book.price * item.quantity;
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

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { items: [], totalPrice: 0, totalItems: 0 },
      { new: true }
    );

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
