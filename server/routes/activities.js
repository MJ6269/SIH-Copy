const express = require('express');
const multer = require('multer');
const path = require('path');
const Activity = require('../models/Activity');
const Student = require('../models/Student');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/activities/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents are allowed'));
    }
  }
});

// Get all activities for a student
router.get('/student', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const activities = await Activity.find({ studentId: student._id })
      .sort({ createdAt: -1 });

    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Failed to fetch activities' });
  }
});

// Create new activity
router.post('/', authenticateToken, requireRole(['student']), upload.array('documents', 5), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const { title, description, type, category, organization, skills, duration, startDate, endDate } = req.body;

    // Process uploaded files
    const documents = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      url: `/uploads/activities/${file.filename}`,
      uploadedAt: new Date()
    })) : [];

    const activity = new Activity({
      studentId: student._id,
      title,
      description,
      type,
      category,
      organization,
      skills: skills ? skills.split(',').map(s => s.trim()) : [],
      duration,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      documents
    });

    await activity.save();
    res.status(201).json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ message: 'Failed to create activity' });
  }
});

// Get activity by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('studentId', 'abcId rollNumber personalInfo')
      .populate('verifiedBy', 'personalInfo');

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Check if user has permission to view this activity
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user._id });
      if (!student || activity.studentId._id.toString() !== student._id.toString()) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.json(activity);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ message: 'Failed to fetch activity' });
  }
});

// Update activity
router.put('/:id', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const activity = await Activity.findOne({
      _id: req.params.id,
      studentId: student._id
    });

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    if (activity.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot update verified activity' });
    }

    const updates = req.body;
    if (updates.skills) {
      updates.skills = updates.skills.split(',').map(s => s.trim());
    }

    Object.assign(activity, updates);
    await activity.save();

    res.json(activity);
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ message: 'Failed to update activity' });
  }
});

// Delete activity
router.delete('/:id', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const activity = await Activity.findOne({
      _id: req.params.id,
      studentId: student._id
    });

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    if (activity.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot delete verified activity' });
    }

    await Activity.findByIdAndDelete(req.params.id);
    res.json({ message: 'Activity deleted successfully' });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ message: 'Failed to delete activity' });
  }
});

// Get activities for faculty verification
router.get('/faculty/pending', authenticateToken, requireRole(['faculty']), async (req, res) => {
  try {
    const activities = await Activity.find({ status: 'pending' })
      .populate('studentId', 'abcId rollNumber personalInfo')
      .sort({ createdAt: -1 });

    res.json(activities);
  } catch (error) {
    console.error('Error fetching pending activities:', error);
    res.status(500).json({ message: 'Failed to fetch pending activities' });
  }
});

// Verify activity
router.post('/:id/verify', authenticateToken, requireRole(['faculty']), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const faculty = await Faculty.findOne({ userId: req.user._id });

    if (!faculty) {
      return res.status(404).json({ message: 'Faculty profile not found' });
    }

    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    activity.status = status;
    activity.verifiedBy = faculty._id;
    activity.verifiedAt = new Date();
    
    if (status === 'rejected' && rejectionReason) {
      activity.rejectionReason = rejectionReason;
    }

    await activity.save();
    res.json(activity);
  } catch (error) {
    console.error('Error verifying activity:', error);
    res.status(500).json({ message: 'Failed to verify activity' });
  }
});

module.exports = router;
