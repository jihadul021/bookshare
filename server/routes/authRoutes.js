const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmailOtp,
  resendVerificationOtp,
  login,
  requestPasswordResetOtp,
  resetPasswordWithOtp,
  getMe,
  updateProfile
} = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const { uploadSingleImage } = require('../middleware/uploadMiddleware');

router.post('/register', register);
router.post('/verify-email', verifyEmailOtp);
router.post('/resend-verification-otp', resendVerificationOtp);
router.post('/login', login);
router.post('/forgot-password', requestPasswordResetOtp);
router.post('/reset-password', resetPasswordWithOtp);
router.get('/me', protect, getMe);
router.put('/profile', protect, uploadSingleImage, updateProfile);


module.exports = router;
