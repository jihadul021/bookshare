const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { addBook, getBooks, getBookById, getMyBooks, deleteBook, updateBook } = require('../controllers/bookController');

router.get('/', getBooks);
router.get('/mybooks', protect, getMyBooks);
router.get('/:id', getBookById);
router.post('/', protect, addBook);
router.delete('/:id', protect, deleteBook);
router.put('/:id', protect, updateBook);

module.exports = router;          
