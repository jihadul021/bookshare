// Middleware to check if user is admin
const adminProtect = (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized as admin' });
    }

    next();
  } catch (error) {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

module.exports = adminProtect;
