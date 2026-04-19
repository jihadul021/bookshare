const express = require('express');
const protect = require('../middleware/authMiddleware');
const {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress
} = require('../controllers/addressController');

const router = express.Router();

router.use(protect);
router.get('/', getUserAddresses);
router.post('/', createAddress);
router.put('/:addressId', updateAddress);
router.delete('/:addressId', deleteAddress);

module.exports = router;
