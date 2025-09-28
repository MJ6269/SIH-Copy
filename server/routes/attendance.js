const express = require('express');
const Attendance = require('../models/Attendance');
const QRCode = require('../models/QRCode');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Mark attendance
router.post('/mark', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const { qrData } = req.body;
    
    // Parse QR data
    const qrInfo = JSON.parse(qrData);
    
    // Find active QR code
    const qrCode = await QRCode.findOne({
      qrData: qrData,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });

    if (!qrCode) {
      return res.status(400).json({ message: 'Invalid or expired QR code' });
    }

    // Check if already marked attendance for this class today
    const existingAttendance = await Attendance.findOne({
      studentId: req.user.studentId,
      classId: qrInfo.classId,
      attendanceDate: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999)
      }
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked for this class today' });
    }

    // Create attendance record
    const attendance = new Attendance({
      studentId: req.user.studentId,
      classId: qrInfo.classId,
      qrCodeId: qrCode._id,
      facultyId: qrCode.facultyId,
      attendanceDate: new Date(),
      status: 'present'
    });

    await attendance.save();

    // Update QR code scan count
    qrCode.scanCount += 1;
    await qrCode.save();

    res.json({ message: 'Attendance marked successfully', attendance });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ message: 'Failed to mark attendance' });
  }
});

// Get student attendance records
router.get('/student', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const attendances = await Attendance.find({ studentId: req.user.studentId })
      .populate('facultyId', 'personalInfo')
      .sort({ attendanceDate: -1 });

    res.json(attendances);
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({ message: 'Failed to fetch attendance records' });
  }
});

// Get class attendance (faculty only)
router.get('/class/:classId', authenticateToken, requireRole(['faculty', 'admin']), async (req, res) => {
  try {
    const { classId } = req.params;
    const { date } = req.query;

    const query = { classId };
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.attendanceDate = { $gte: startDate, $lte: endDate };
    }

    const attendances = await Attendance.find(query)
      .populate('studentId', 'personalInfo abcId')
      .sort({ attendanceDate: -1 });

    res.json(attendances);
  } catch (error) {
    console.error('Error fetching class attendance:', error);
    res.status(500).json({ message: 'Failed to fetch class attendance' });
  }
});

module.exports = router;
