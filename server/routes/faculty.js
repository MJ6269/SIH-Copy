const express = require('express');
const Faculty = require('../models/Faculty');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all faculty (admin only)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const faculty = await Faculty.find().populate('userId', 'email displayName');
    res.json(faculty);
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({ message: 'Failed to fetch faculty' });
  }
});

// Get faculty by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id).populate('userId', 'email displayName');
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Check if user can view this faculty
    if (req.user.role === 'faculty' && req.user._id.toString() !== faculty.userId._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(faculty);
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({ message: 'Failed to fetch faculty' });
  }
});

// Update faculty
router.put('/:id', authenticateToken, requireRole(['faculty', 'admin']), async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Check if user can update this faculty
    if (req.user.role === 'faculty' && req.user._id.toString() !== faculty.userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = req.body;
    Object.assign(faculty, updates);
    await faculty.save();

    res.json(faculty);
  } catch (error) {
    console.error('Error updating faculty:', error);
    res.status(500).json({ message: 'Failed to update faculty' });
  }
});

module.exports = router;
