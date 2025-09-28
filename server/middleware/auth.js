const admin = require('firebase-admin');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.firebaseUser = decodedToken;

    // Get user from database
    let user = await User.findOne({ firebaseUid: decodedToken.uid });
    if (!user) {
      // Don't auto-create user - let them choose their role first
      return res.status(403).json({ 
        message: 'User not registered. Please complete registration first.',
        needsRegistration: true 
      });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ message: 'User account is inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

module.exports = { authenticateToken, requireRole };
