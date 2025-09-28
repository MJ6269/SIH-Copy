const express = require('express');
const QRCode = require('../models/QRCode');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Generate QR code (faculty only)
router.post('/generate', authenticateToken, requireRole(['faculty']), async (req, res) => {
  try {
    const { classInfo, duration = 30 } = req.body;
    
    const qrData = JSON.stringify({
      classId: classInfo.classId,
      subject: classInfo.subject,
      facultyId: req.user._id,
      timestamp: Date.now()
    });

    const qrCode = new QRCode({
      facultyId: req.user._id,
      classId: classInfo.classId,
      qrData: qrData,
      isActive: true,
      expiresAt: new Date(Date.now() + duration * 60 * 1000), // duration in minutes
      scanCount: 0
    });

    await qrCode.save();

    res.json({
      qrCodeId: qrCode._id,
      qrData: qrData,
      expiresAt: qrCode.expiresAt,
      duration: duration
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ message: 'Failed to generate QR code' });
  }
});

// Get QR codes for faculty
router.get('/faculty', authenticateToken, requireRole(['faculty']), async (req, res) => {
  try {
    const qrCodes = await QRCode.find({ facultyId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(qrCodes);
  } catch (error) {
    console.error('Error fetching QR codes:', error);
    res.status(500).json({ message: 'Failed to fetch QR codes' });
  }
});

// Deactivate QR code
router.put('/:id/deactivate', authenticateToken, requireRole(['faculty']), async (req, res) => {
  try {
    const qrCode = await QRCode.findById(req.params.id);
    
    if (!qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    if (qrCode.facultyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    qrCode.isActive = false;
    await qrCode.save();

    res.json({ message: 'QR code deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating QR code:', error);
    res.status(500).json({ message: 'Failed to deactivate QR code' });
  }
});

module.exports = router;
