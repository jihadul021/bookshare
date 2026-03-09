const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

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

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

    res.json({
      _id: user._id,
      name: user.name,
      gender: user.gender,
      email: user.email,
      profilePicture: user.profilePicture,
      joinDate: user.joinDate,
      token: generateToken(user._id)
    }); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
