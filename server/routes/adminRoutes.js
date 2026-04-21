const express = require('express');
const {
  getAllUsers,
  getUserProfile,
  disableUserAccount,
  enableUserAccount,
  getAllBooksWithStats,
  deleteBookByAdmin,
  getUserOrders,
  getSellerProfile,
  getDashboardStats,
  getAllOrders
} = require('../controllers/adminController');

const protect = require('../middleware/authMiddleware');
const adminProtect = require('../middleware/adminMiddleware');

const router = express.Router();

// All routes require auth + admin role
router.use(protect);
router.use(adminProtect);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Users management
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserProfile);
router.patch('/users/:userId/disable', disableUserAccount);
router.patch('/users/:userId/enable', enableUserAccount);

// Books management
router.get('/books', getAllBooksWithStats);
router.delete('/books/:bookId', deleteBookByAdmin);

// Orders management
router.get('/users/:userId/orders', getUserOrders);
router.get('/orders', getAllOrders);

// Seller management
router.get('/sellers/:sellerId', getSellerProfile);

module.exports = router;
