const express = require('express');
const Student = require('../models/Student');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all students (admin/faculty only)
router.get('/', authenticateToken, requireRole(['admin', 'faculty']), async (req, res) => {
  try {
    const students = await Student.find().populate('userId', 'email displayName');
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

// Get student by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('userId', 'email displayName');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if user can view this student
    if (req.user.role === 'student' && req.user._id.toString() !== student.userId._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Failed to fetch student' });
  }
});

// Update student
router.put('/:id', authenticateToken, requireRole(['student', 'admin']), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if user can update this student
    if (req.user.role === 'student' && req.user._id.toString() !== student.userId.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = req.body;
    Object.assign(student, updates);
    await student.save();

    res.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Failed to update student' });
  }
});

module.exports = router;
