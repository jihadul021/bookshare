const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { addBook, getBooks, getBookById, getMyBooks, deleteBook, updateBook, searchBooks, getSellerBooks } = require('../controllers/bookController');

router.get('/', getBooks);
router.get('/search', searchBooks);
router.get('/seller/:sellerId', getSellerBooks);
router.get('/mybooks', protect, getMyBooks);
router.get('/:id', getBookById);
router.post('/', protect, addBook);
router.delete('/:id', protect, deleteBook);
router.put('/:id', protect, updateBook);

module.exports = router;          
