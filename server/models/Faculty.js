const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  personalInfo: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String
    }
  },
  academicInfo: {
    qualifications: [{
      degree: String,
      institution: String,
      year: Number
    }],
    subjects: [String],
    experience: {
      type: Number,
      default: 0
    }
  },
  classes: [{
    classId: String,
    className: String,
    subject: String,
    semester: Number,
    year: Number
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Faculty', facultySchema);
