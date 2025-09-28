const express = require('express');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Activity = require('../models/Activity');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get admin dashboard stats
router.get('/stats', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await Student.countDocuments();
    const totalFaculty = await Faculty.countDocuments();
    const totalActivities = await Activity.countDocuments();
    const pendingActivities = await Activity.countDocuments({ status: 'pending' });

    res.json({
      totalUsers,
      totalStudents,
      totalFaculty,
      totalActivities,
      pendingActivities
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Failed to fetch admin stats' });
  }
});

// Get all users for admin management
router.get('/users', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const users = await User.find().select('-firebaseUid');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Update user role
router.put('/users/:id/role', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
});

// Toggle user status
router.put('/users/:id/status', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

module.exports = router;
