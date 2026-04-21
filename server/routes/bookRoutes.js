const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { uploadMultipleImages } = require('../middleware/uploadMiddleware');
const { addBook, getBooks, getBookById, getMyBooks, deleteBook, updateBook, searchBooks, getSellerBooks, addBookReview } = require('../controllers/bookController');

router.get('/', getBooks);
router.get('/search', searchBooks);
router.get('/seller/:sellerId', getSellerBooks);
router.get('/mybooks', protect, getMyBooks);
router.get('/:id', getBookById);
router.post('/:id/reviews', protect, addBookReview);
router.post('/', protect, uploadMultipleImages, addBook);
router.delete('/:id', protect, deleteBook);
router.put('/:id', protect, uploadMultipleImages, updateBook);

module.exports = router;          
