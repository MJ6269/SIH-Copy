const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  classId: {
    type: String,
    required: true
  },
  qrCodeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QRCode',
    required: true
  },
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  attendanceDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    required: true
  },
  scannedAt: {
    type: Date,
    default: Date.now
  },
  location: {
    latitude: Number,
    longitude: Number
  }
}, {
  timestamps: true
});

// Index for efficient queries
attendanceSchema.index({ studentId: 1, classId: 1, attendanceDate: 1 });
attendanceSchema.index({ qrCodeId: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
