const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register 
exports.register = async (req, res) => {
  try {
    const { name, email, password, gender} = req.body;

    if (!gender) return res.status(400).json({ message: 'Gender is required' });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, gender });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      gender: user.gender,      
      email: user.email,
      phone: user.phone,
      address: user.address,
      profilePicture: user.profilePicture,
      role: user.role,
      isverified: user.isverified,
      joinDate: user.joinDate,
      token: generateToken(user._id),

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

// Login 
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });
    if (user.isDisabled) {
      return res.status(403).json({
        message: 'Your account has been disabled.Please contact administrator for further details'
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      gender: user.gender,
      email: user.email,
      profilePicture: user.profilePicture,
      joinDate: user.joinDate,
      role: user.role,
      isverified: user.isverified,
      token: generateToken(user._id)
    }); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, profilePicture, email, gender, password } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : undefined;
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
    
    // Handle profile picture upload
    if (req.file) {
      user.profilePicture = `/uploads/${req.file.filename}`;
    } else if (typeof profilePicture !== 'undefined') {
      // Support base64 profile pictures for backward compatibility
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
