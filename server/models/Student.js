const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  abcId: {
    type: String,
    required: true,
    unique: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  enrollmentNumber: {
    type: String,
    required: true,
    unique: true
  },
  course: {
    type: String,
    required: true
  },
  branch: {
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
  personalInfo: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    dateOfBirth: {
      type: Date,
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
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String
    }
  },
  academicInfo: {
    cgpa: {
      type: Number,
      default: 0
    },
    totalCredits: {
      type: Number,
      default: 0
    },
    completedCredits: {
      type: Number,
      default: 0
    },
    attendancePercentage: {
      type: Number,
      default: 0
    }
  },
  portfolio: {
    bio: {
      type: String,
      default: ''
    },
    skills: [String],
    achievements: [String],
    projects: [{
      title: String,
      description: String,
      technologies: [String],
      link: String
    }]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
