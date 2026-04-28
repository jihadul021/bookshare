const crypto = require('crypto');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendBookShareEmail } = require('../utils/emailService');

const OTP_EXPIRY_MINUTES = 10;

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const generateOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;

const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

const getOtpExpiry = () => new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

const buildAuthPayload = (user) => ({
  _id: user._id,
  name: user.name,
  gender: user.gender,
  email: user.email,
  phone: user.phone,
  address: user.address,
  profilePicture: user.profilePicture,
  joinDate: user.joinDate,
  role: user.role,
  isverified: user.isverified,
  token: generateToken(user._id)
});

const sendOtpEmail = async ({ name, email, otp, subject, intro, actionLabel }) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
      <div style="padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px;">
        <h1 style="margin: 0 0 16px; color: #f97316;">BookShare</h1>
        <p style="margin: 0 0 12px;">Hi ${name || 'Reader'},</p>
        <p style="margin: 0 0 20px;">${intro}</p>
        <div style="margin: 24px 0; padding: 18px; background: #fff7ed; border-radius: 12px; text-align: center;">
          <div style="font-size: 12px; letter-spacing: 1.5px; color: #9a3412; text-transform: uppercase; margin-bottom: 8px;">${actionLabel}</div>
          <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #c2410c;">${otp}</div>
        </div>
        <p style="margin: 0 0 8px;">This OTP is valid for ${OTP_EXPIRY_MINUTES} minutes.</p>
        <p style="margin: 0; color: #6b7280;">If you did not request this, you can safely ignore this BookShare email.</p>
      </div>
    </div>
  `;

  const text = `BookShare\n\nHi ${name || 'Reader'},\n\n${intro}\n\n${actionLabel}: ${otp}\n\nThis OTP is valid for ${OTP_EXPIRY_MINUTES} minutes.`;

  await sendBookShareEmail({
    to: email,
    subject,
    html,
    text
  });
};

const issueEmailVerificationOtp = async (user) => {
  const otp = generateOtp();
  user.emailVerificationOtpHash = hashOtp(otp);
  user.emailVerificationOtpExpires = getOtpExpiry();
  await user.save();

  await sendOtpEmail({
    name: user.name,
    email: user.email,
    otp,
    subject: 'BookShare account verification OTP',
    intro: 'Use this OTP to verify your BookShare account and finish creating your profile.',
    actionLabel: 'Verification OTP'
  });
};

const issuePasswordResetOtp = async (user) => {
  const otp = generateOtp();
  user.passwordResetOtpHash = hashOtp(otp);
  user.passwordResetOtpExpires = getOtpExpiry();
  await user.save();

  await sendOtpEmail({
    name: user.name,
    email: user.email,
    otp,
    subject: 'BookShare password reset OTP',
    intro: 'Use this OTP to reset your BookShare password.',
    actionLabel: 'Password Reset OTP'
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, gender } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!name || !normalizedEmail || !password || !gender) {
      return res.status(400).json({ message: 'Name, email, gender, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      gender,
      isverified: false
    });

    await issueEmailVerificationOtp(user);

    res.status(201).json({
      success: true,
      requiresVerification: true,
      email: user.email,
      message: 'Account created. A BookShare OTP has been sent to your email for verification.'
    });
  } catch (error) {
    console.error('[POST /api/auth/register] Error:', error);

    if (error?.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0] || 'field';
      return res.status(400).json({ message: `${duplicateField} already exists` });
    }

    if (error?.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: error.message });
  }
};

exports.verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isverified) {
      return res.status(200).json({ success: true, message: 'Your BookShare email is already verified. You can log in now.' });
    }

    if (!user.emailVerificationOtpHash || !user.emailVerificationOtpExpires) {
      return res.status(400).json({ message: 'No active verification OTP found. Please request a new one.' });
    }

    if (user.emailVerificationOtpExpires < new Date()) {
      return res.status(400).json({ message: 'This OTP has expired. Please request a new BookShare verification code.' });
    }

    if (user.emailVerificationOtpHash !== hashOtp(otp)) {
      return res.status(400).json({ message: 'Invalid OTP. Please check your BookShare email and try again.' });
    }

    user.isverified = true;
    user.emailVerificationOtpHash = '';
    user.emailVerificationOtpExpires = null;
    await user.save();

    res.json({
      success: true,
      message: 'Your email has been verified successfully. You can now log in to BookShare.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resendVerificationOtp = async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);

    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isverified) {
      return res.status(400).json({ message: 'This BookShare account is already verified.' });
    }

    await issueEmailVerificationOtp(user);

    res.json({
      success: true,
      message: 'A new BookShare verification OTP has been sent to your email.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);
    const { password } = req.body;

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    if (user.isDisabled) {
      return res.status(403).json({
        message: 'Your account has been disabled.Please contact administrator for further details'
      });
    }

    if (!user.isverified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in to BookShare.',
        requiresVerification: true,
        email: user.email
      });
    }

    res.json(buildAuthPayload(user));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.requestPasswordResetOtp = async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);

    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.json({
        success: true,
        message: 'If a BookShare account exists for that email, a password reset OTP has been sent.'
      });
    }

    await issuePasswordResetOtp(user);

    res.json({
      success: true,
      message: 'A BookShare password reset OTP has been sent to your email.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPasswordWithOtp = async (req, res) => {
  try {
    const normalizedEmail = normalizeEmail(req.body.email);
    const { otp, password } = req.body;

    if (!normalizedEmail || !otp || !password) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.passwordResetOtpHash || !user.passwordResetOtpExpires) {
      return res.status(400).json({ message: 'No active password reset OTP found. Please request a new BookShare OTP.' });
    }

    if (user.passwordResetOtpExpires < new Date()) {
      return res.status(400).json({ message: 'This OTP has expired. Please request a new BookShare password reset code.' });
    }

    if (user.passwordResetOtpHash !== hashOtp(otp)) {
      return res.status(400).json({ message: 'Invalid OTP. Please check your BookShare email and try again.' });
    }

    user.password = password;
    user.passwordResetOtpHash = '';
    user.passwordResetOtpExpires = null;
    await user.save();

    res.json({
      success: true,
      message: 'Your BookShare password has been reset successfully. You can now log in.'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, profilePicture, email, gender, password } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const normalizedEmail = typeof email === 'string' ? normalizeEmail(email) : undefined;
    const normalizedName = typeof name === 'string' ? name.trim() : undefined;

    if (typeof normalizedName !== 'undefined' && !normalizedName) {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (typeof normalizedEmail !== 'undefined' && !normalizedEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (normalizedEmail && normalizedEmail !== user.email) {
      const emailExists = await User.findOne({ email: normalizedEmail });
      if (emailExists) return res.status(400).json({ message: 'Email already in use' });
      user.email = normalizedEmail;
    }

    if (normalizedName) user.name = normalizedName;
    if (typeof phone !== 'undefined') user.phone = phone ? phone.trim() : '';
    if (typeof address !== 'undefined') user.address = address ? address.trim() : '';

    if (req.file) {
      user.profilePicture = `/uploads/${req.file.filename}`;
    } else if (typeof profilePicture !== 'undefined') {
      user.profilePicture = profilePicture || '';
    }

    if (typeof gender !== 'undefined') user.gender = gender;

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      user.password = password;
    }

    const updated = await user.save();
    res.json({
      _id: updated._id,
      name: updated.name,
      gender: updated.gender,
      email: updated.email,
      phone: updated.phone,
      address: updated.address,
      profilePicture: updated.profilePicture,
      joinDate: updated.joinDate,
      role: updated.role,
      isverified: updated.isverified,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
