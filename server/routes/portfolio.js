const express = require('express');
const Portfolio = require('../models/Portfolio');
const Student = require('../models/Student');
const Activity = require('../models/Activity');
const aiService = require('../services/aiService');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get portfolio for a student
router.get('/student', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    let portfolio = await Portfolio.findOne({ studentId: student._id });
    
    if (!portfolio) {
      // Generate initial portfolio
      portfolio = await generatePortfolio(student._id);
    }

    res.json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({ message: 'Failed to fetch portfolio' });
  }
});

// Generate/regenerate portfolio using AI
router.post('/generate', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Get student's activities
    const activities = await Activity.find({ 
      studentId: student._id, 
      status: 'approved' 
    }).sort({ createdAt: -1 });

    // Prepare data for AI
    const studentData = {
      personalInfo: student.personalInfo,
      course: student.course,
      branch: student.branch,
      semester: student.semester,
      year: student.year,
      academicInfo: student.academicInfo,
      activities: activities,
      skills: student.portfolio?.skills || [],
      achievements: student.portfolio?.achievements || [],
      projects: student.portfolio?.projects || []
    };

    // Generate portfolio using AI
    const aiPortfolio = await aiService.generatePortfolio(studentData);
    
    // Generate additional AI insights
    const summary = await aiService.generatePortfolioSummary(studentData);
    const recommendations = await aiService.generateRecommendations(studentData);

    // Update or create portfolio
    const portfolioData = {
      studentId: student._id,
      bio: aiPortfolio.bio,
      skills: aiPortfolio.skills,
      achievements: aiPortfolio.achievements,
      projects: aiPortfolio.projects,
      academicSummary: student.academicInfo,
      socialLinks: {
        email: req.user.email,
        linkedin: student.portfolio?.socialLinks?.linkedin || '',
        github: student.portfolio?.socialLinks?.github || '',
        portfolio: student.portfolio?.socialLinks?.portfolio || ''
      },
      certificates: activities.map(activity => ({
        activityId: activity._id,
        title: activity.title,
        organization: activity.organization,
        issuedDate: activity.verifiedAt || activity.createdAt
      })),
      aiInsights: {
        summary,
        recommendations,
        strengths: aiPortfolio.strengths,
        careerObjectives: aiPortfolio.careerObjectives
      },
      lastGenerated: new Date()
    };

    let portfolio = await Portfolio.findOne({ studentId: student._id });
    
    if (portfolio) {
      Object.assign(portfolio, portfolioData);
      await portfolio.save();
    } else {
      portfolio = new Portfolio(portfolioData);
      await portfolio.save();
    }

    res.json(portfolio);
  } catch (error) {
    console.error('Error generating portfolio:', error);
    res.status(500).json({ message: 'Failed to generate portfolio' });
  }
});

// Update portfolio manually
router.put('/update', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const updates = req.body;
    
    let portfolio = await Portfolio.findOne({ studentId: student._id });
    
    if (portfolio) {
      Object.assign(portfolio, updates);
      await portfolio.save();
    } else {
      portfolio = new Portfolio({
        studentId: student._id,
        ...updates,
        socialLinks: {
          email: req.user.email,
          ...updates.socialLinks
        }
      });
      await portfolio.save();
    }

    res.json(portfolio);
  } catch (error) {
    console.error('Error updating portfolio:', error);
    res.status(500).json({ message: 'Failed to update portfolio' });
  }
});

// Get public portfolio (for sharing)
router.get('/public/:studentId', async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ 
      studentId: req.params.studentId,
      isPublic: true 
    }).populate('studentId', 'abcId personalInfo');

    if (!portfolio) {
      return res.status(404).json({ message: 'Portfolio not found or not public' });
    }

    res.json(portfolio);
  } catch (error) {
    console.error('Error fetching public portfolio:', error);
    res.status(500).json({ message: 'Failed to fetch portfolio' });
  }
});

// Toggle portfolio visibility
router.put('/visibility', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const { isPublic } = req.body;
    
    let portfolio = await Portfolio.findOne({ studentId: student._id });
    
    if (portfolio) {
      portfolio.isPublic = isPublic;
      await portfolio.save();
    } else {
      return res.status(404).json({ message: 'Portfolio not found' });
    }

    res.json({ message: 'Portfolio visibility updated', isPublic });
  } catch (error) {
    console.error('Error updating portfolio visibility:', error);
    res.status(500).json({ message: 'Failed to update portfolio visibility' });
  }
});

// Get portfolio analytics
router.get('/analytics', authenticateToken, requireRole(['student']), async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const portfolio = await Portfolio.findOne({ studentId: student._id });
    const activities = await Activity.find({ studentId: student._id });
    
    const analytics = {
      totalActivities: activities.length,
      approvedActivities: activities.filter(a => a.status === 'approved').length,
      pendingActivities: activities.filter(a => a.status === 'pending').length,
      portfolioViews: portfolio?.views || 0,
      lastUpdated: portfolio?.lastGenerated,
      skillsCount: portfolio?.skills?.length || 0,
      projectsCount: portfolio?.projects?.length || 0,
      certificatesCount: portfolio?.certificates?.length || 0
    };

    res.json(analytics);
  } catch (error) {
    console.error('Error fetching portfolio analytics:', error);
    res.status(500).json({ message: 'Failed to fetch portfolio analytics' });
  }
});

// Helper function to generate initial portfolio
async function generatePortfolio(studentId) {
  try {
    const student = await Student.findById(studentId);
    const activities = await Activity.find({ 
      studentId: studentId, 
      status: 'approved' 
    });

    const portfolioData = {
      studentId: studentId,
      bio: `I am ${student.personalInfo.firstName} ${student.personalInfo.lastName}, a dedicated ${student.course} student specializing in ${student.branch}. With a strong academic foundation and active participation in various activities, I am committed to excellence in both academic and professional pursuits.`,
      skills: student.portfolio?.skills || ['Problem Solving', 'Teamwork', 'Communication'],
      achievements: student.portfolio?.achievements || [],
      projects: student.portfolio?.projects || [],
      academicSummary: student.academicInfo,
      socialLinks: {
        email: student.userId.email || '',
        linkedin: '',
        github: '',
        portfolio: ''
      },
      certificates: activities.map(activity => ({
        activityId: activity._id,
        title: activity.title,
        organization: activity.organization,
        issuedDate: activity.verifiedAt || activity.createdAt
      })),
      isPublic: false,
      lastGenerated: new Date()
    };

    const portfolio = new Portfolio(portfolioData);
    await portfolio.save();
    return portfolio;
  } catch (error) {
    console.error('Error generating initial portfolio:', error);
    throw error;
  }
}

module.exports = router;
