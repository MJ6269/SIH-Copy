const express = require('express');
const admin = require('firebase-admin');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { firebaseUid, email, displayName, photoURL, role, additionalData } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ firebaseUid });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = new User({
      firebaseUid,
      email,
      displayName,
      photoURL: photoURL || '',
      role
    });

    await user.save();

    // Create role-specific profile
    if (role === 'student' && additionalData) {
      const student = new Student({
        userId: user._id,
        abcId: additionalData.abcId,
        rollNumber: additionalData.rollNumber,
        enrollmentNumber: additionalData.enrollmentNumber,
        course: additionalData.course,
        branch: additionalData.branch,
        semester: additionalData.semester,
        year: additionalData.year,
        personalInfo: {
          firstName: additionalData.firstName,
          lastName: additionalData.lastName,
          dateOfBirth: additionalData.dateOfBirth,
          phone: additionalData.phone
        }
      });
      await student.save();
    } else if (role === 'faculty' && additionalData) {
      const faculty = new Faculty({
        userId: user._id,
        employeeId: additionalData.employeeId,
        department: additionalData.department,
        designation: additionalData.designation,
        personalInfo: additionalData.personalInfo,
        academicInfo: additionalData.academicInfo
      });
      await faculty.save();
    }

    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    let profile = null;

    if (user.role === 'student') {
      profile = await Student.findOne({ userId: user._id }).populate('userId');
    } else if (user.role === 'faculty') {
      profile = await Faculty.findOne({ userId: user._id }).populate('userId');
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: user.role,
        lastLogin: user.lastLogin
      },
      profile
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const updates = req.body;

    // Update user basic info
    if (updates.displayName || updates.photoURL) {
      await User.findByIdAndUpdate(user._id, {
        displayName: updates.displayName || user.displayName,
        photoURL: updates.photoURL || user.photoURL
      });
    }

    // Update role-specific profile
    if (user.role === 'student') {
      await Student.findOneAndUpdate(
        { userId: user._id },
        { $set: updates },
        { new: true }
      );
    } else if (user.role === 'faculty') {
      await Faculty.findOneAndUpdate(
        { userId: user._id },
        { $set: updates },
        { new: true }
      );
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Profile update failed' });
  }
});

// Verify ABC ID (for student registration)
router.post('/verify-abc-id', async (req, res) => {
  try {
    const { abcId } = req.body;

    // Check if ABC ID already exists
    const existingStudent = await Student.findOne({ abcId });
    if (existingStudent) {
      return res.status(400).json({ message: 'ABC ID already registered' });
    }

    // In a real implementation, you would verify with Mumbai University's ABC system
    // For now, we'll just validate the format
    if (!abcId || !abcId.startsWith('ABC')) {
      return res.status(400).json({ message: 'Invalid ABC ID format' });
    }

    res.json({ message: 'ABC ID is valid and available' });
  } catch (error) {
    console.error('ABC ID verification error:', error);
    res.status(500).json({ message: 'ABC ID verification failed' });
  }
});

module.exports = router;
