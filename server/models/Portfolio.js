const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    required: true
  },
  skills: [String],
  achievements: [String],
  projects: [{
    title: String,
    description: String,
    technologies: [String],
    link: String,
    imageUrl: String
  }],
  certificates: [{
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity'
    },
    title: String,
    organization: String,
    issuedDate: Date,
    credentialId: String
  }],
  academicSummary: {
    cgpa: Number,
    totalCredits: Number,
    completedCredits: Number,
    attendancePercentage: Number,
    currentSemester: Number
  },
  socialLinks: {
    linkedin: String,
    github: String,
    portfolio: String,
    email: {
      type: String,
      required: true
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  aiInsights: {
    summary: String,
    recommendations: [String],
    strengths: [String],
    careerObjectives: {
      shortTerm: String,
      longTerm: String
    }
  },
  lastGenerated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Portfolio', portfolioSchema);
