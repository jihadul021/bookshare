const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { addBook, getBooks, getBookById, getMyBooks, deleteBook } = require('../controllers/bookController');

router.get('/', getBooks);
router.get('/mybooks', protect, getMyBooks);
router.get('/:id', getBookById);
router.post('/', protect, addBook);
router.delete('/:id', protect, deleteBook);

module.exports = router;