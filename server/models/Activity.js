const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['certification', 'workshop', 'conference', 'internship', 'research', 'volunteer', 'other'],
    required: true
  },
  category: {
    type: String,
    enum: ['technical', 'leadership', 'academic', 'sports', 'cultural', 'social'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'in_process'],
    default: 'pending'
  },
  documents: [{
    filename: String,
    originalName: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty'
  },
  verifiedAt: Date,
  rejectionReason: String,
  duration: String,
  startDate: Date,
  endDate: Date,
  organization: {
    type: String,
    required: true
  },
  skills: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('Activity', activitySchema);
