const mongoose = require('mongoose');

const qrCodeSchema = new mongoose.Schema({
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true
  },
  classId: {
    type: String,
    required: true
  },
  className: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  qrData: {
    type: String,
    required: true,
    unique: true
  },
  qrImageUrl: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  scanCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
qrCodeSchema.index({ facultyId: 1, isActive: 1 });
qrCodeSchema.index({ qrData: 1 });
qrCodeSchema.index({ expiresAt: 1 });

module.exports = mongoose.model('QRCode', qrCodeSchema);
