const express = require('express');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Activity = require('../models/Activity');
const Attendance = require('../models/Attendance');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get general analytics (admin only)
router.get('/overview', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await Student.countDocuments();
    const totalFaculty = await Faculty.countDocuments();
    const totalActivities = await Activity.countDocuments();
    const pendingActivities = await Activity.countDocuments({ status: 'pending' });
    const approvedActivities = await Activity.countDocuments({ status: 'approved' });
    const rejectedActivities = await Activity.countDocuments({ status: 'rejected' });

    // Get activity trends for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activityTrends = await Activity.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get attendance statistics
    const totalAttendanceRecords = await Attendance.countDocuments();
    const presentRecords = await Attendance.countDocuments({ status: 'present' });
    const attendanceRate = totalAttendanceRecords > 0 ? (presentRecords / totalAttendanceRecords) * 100 : 0;

    res.json({
      overview: {
        totalUsers,
        totalStudents,
        totalFaculty,
        totalActivities,
        pendingActivities,
        approvedActivities,
        rejectedActivities,
        totalAttendanceRecords,
        attendanceRate: Math.round(attendanceRate * 100) / 100
      },
      activityTrends
    });
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ message: 'Failed to fetch analytics overview' });
  }
});

// Get student-specific analytics
router.get('/student/:studentId', authenticateToken, requireRole(['admin', 'faculty']), async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId).populate('userId', 'email displayName');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get student activities
    const activities = await Activity.find({ studentId }).sort({ createdAt: -1 });
    const activityStats = {
      total: activities.length,
      pending: activities.filter(a => a.status === 'pending').length,
      approved: activities.filter(a => a.status === 'approved').length,
      rejected: activities.filter(a => a.status === 'rejected').length
    };

    // Get attendance records
    const attendanceRecords = await Attendance.find({ studentId }).sort({ attendanceDate: -1 });
    const attendanceStats = {
      total: attendanceRecords.length,
      present: attendanceRecords.filter(a => a.status === 'present').length,
      absent: attendanceRecords.filter(a => a.status === 'absent').length
    };

    res.json({
      student,
      activityStats,
      attendanceStats,
      activities: activities.slice(0, 10), // Last 10 activities
      attendanceRecords: attendanceRecords.slice(0, 10) // Last 10 attendance records
    });
  } catch (error) {
    console.error('Error fetching student analytics:', error);
    res.status(500).json({ message: 'Failed to fetch student analytics' });
  }
});

// Get class analytics
router.get('/class/:classId', authenticateToken, requireRole(['admin', 'faculty']), async (req, res) => {
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

    const attendanceRecords = await Attendance.find(query)
      .populate('studentId', 'personalInfo abcId')
      .sort({ attendanceDate: -1 });

    const attendanceStats = {
      total: attendanceRecords.length,
      present: attendanceRecords.filter(a => a.status === 'present').length,
      absent: attendanceRecords.filter(a => a.status === 'absent').length
    };

    res.json({
      classId,
      attendanceStats,
      attendanceRecords
    });
  } catch (error) {
    console.error('Error fetching class analytics:', error);
    res.status(500).json({ message: 'Failed to fetch class analytics' });
  }
});

module.exports = router;
