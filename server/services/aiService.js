const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyA137qes9HzGAXKPwNtXt9lu1nkwGI4Rr8');

class AIService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  async generatePortfolio(studentData) {
    try {
      const prompt = this.createPortfolioPrompt(studentData);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const portfolioData = response.text();
      
      return this.parsePortfolioData(portfolioData, studentData);
    } catch (error) {
      console.error('Error generating portfolio with Gemini:', error);
      throw new Error('Failed to generate portfolio');
    }
  }

  createPortfolioPrompt(studentData) {
    const {
      personalInfo,
      academicInfo,
      activities,
      skills = [],
      achievements = [],
      projects = []
    } = studentData;

    return `
Generate a professional portfolio for a student based on the following information:

**Personal Information:**
- Name: ${personalInfo?.firstName} ${personalInfo?.lastName}
- Course: ${studentData.course}
- Branch: ${studentData.branch}
- Semester: ${studentData.semester}
- Year: ${studentData.year}

**Academic Performance:**
- CGPA: ${academicInfo?.cgpa || 'Not specified'}
- Attendance: ${academicInfo?.attendancePercentage || 0}%
- Credits Completed: ${academicInfo?.completedCredits || 0}/${academicInfo?.totalCredits || 0}

**Activities & Achievements:**
${activities?.map(activity => `- ${activity.title} (${activity.type}): ${activity.description}`).join('\n') || 'No activities recorded'}

**Skills:**
${skills.join(', ') || 'No skills specified'}

**Achievements:**
${achievements.join(', ') || 'No achievements specified'}

**Projects:**
${projects?.map(project => `- ${project.title}: ${project.description}`).join('\n') || 'No projects specified'}

Please generate a professional portfolio with the following structure:

1. **Professional Bio** (2-3 paragraphs highlighting academic journey, key strengths, and career aspirations)
2. **Key Skills** (categorized and prioritized)
3. **Academic Excellence** (highlighting performance metrics and achievements)
4. **Notable Projects** (detailed descriptions of significant work)
5. **Extracurricular Activities** (leadership roles, certifications, workshops)
6. **Career Objectives** (short-term and long-term goals)
7. **Contact Information** (professional email and social links)

Make the portfolio professional, engaging, and suitable for job applications and academic presentations. Focus on quantifiable achievements and specific examples of leadership and technical skills.

Return the response in JSON format with the following structure:
{
  "bio": "Professional bio text",
  "skills": ["skill1", "skill2", "skill3"],
  "achievements": ["achievement1", "achievement2"],
  "projects": [
    {
      "title": "Project Title",
      "description": "Project description",
      "technologies": ["tech1", "tech2"],
      "highlights": ["highlight1", "highlight2"]
    }
  ],
  "careerObjectives": {
    "shortTerm": "Short-term goals",
    "longTerm": "Long-term goals"
  },
  "strengths": ["strength1", "strength2", "strength3"],
  "recommendations": ["recommendation1", "recommendation2"]
}
`;
  }

  parsePortfolioData(aiResponse, studentData) {
    try {
      // Try to parse JSON response
      const portfolioData = JSON.parse(aiResponse);
      
      return {
        bio: portfolioData.bio || this.generateDefaultBio(studentData),
        skills: portfolioData.skills || studentData.skills || [],
        achievements: portfolioData.achievements || studentData.achievements || [],
        projects: portfolioData.projects || studentData.projects || [],
        careerObjectives: portfolioData.careerObjectives || {
          shortTerm: "Complete current semester with excellent grades",
          longTerm: "Secure a position in a leading technology company"
        },
        strengths: portfolioData.strengths || [],
        recommendations: portfolioData.recommendations || [],
        lastGenerated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Fallback to default portfolio generation
      return this.generateDefaultPortfolio(studentData);
    }
  }

  generateDefaultBio(studentData) {
    const { personalInfo, course, branch, academicInfo } = studentData;
    const name = `${personalInfo?.firstName} ${personalInfo?.lastName}`;
    const cgpa = academicInfo?.cgpa || 'excellent';
    const attendance = academicInfo?.attendancePercentage || 0;
    
    return `I am ${name}, a dedicated ${course} student specializing in ${branch}. With a strong academic foundation and a CGPA of ${cgpa}, I have consistently demonstrated excellence in my studies while maintaining ${attendance}% attendance. My passion for technology and continuous learning drives me to explore innovative solutions and contribute meaningfully to the field of computer science.

Throughout my academic journey, I have actively participated in various extracurricular activities, workshops, and projects that have enhanced my technical skills and leadership abilities. I am particularly interested in emerging technologies and their practical applications in solving real-world problems.

I am seeking opportunities to apply my knowledge and skills in a professional environment where I can contribute to meaningful projects while continuing to grow and learn from experienced professionals in the industry.`;
  }

  generateDefaultPortfolio(studentData) {
    return {
      bio: this.generateDefaultBio(studentData),
      skills: studentData.skills || ['Problem Solving', 'Teamwork', 'Communication'],
      achievements: studentData.achievements || ['Academic Excellence', 'Active Participation'],
      projects: studentData.projects || [],
      careerObjectives: {
        shortTerm: "Complete current semester with excellent grades",
        longTerm: "Secure a position in a leading technology company"
      },
      strengths: ['Analytical Thinking', 'Adaptability', 'Continuous Learning'],
      recommendations: [
        'Consider participating in more technical competitions',
        'Build a strong professional network',
        'Focus on developing specialized skills in your field of interest'
      ],
      lastGenerated: new Date().toISOString()
    };
  }

  async generatePortfolioSummary(studentData) {
    try {
      const prompt = `
Analyze the following student data and provide a brief professional summary (2-3 sentences):

Student: ${studentData.personalInfo?.firstName} ${studentData.personalInfo?.lastName}
Course: ${studentData.course} - ${studentData.branch}
CGPA: ${studentData.academicInfo?.cgpa}
Activities: ${studentData.activities?.length || 0} activities completed
Skills: ${studentData.skills?.join(', ') || 'Not specified'}

Provide a concise, professional summary highlighting key strengths and potential.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating portfolio summary:', error);
      return `${studentData.personalInfo?.firstName} ${studentData.personalInfo?.lastName} is a dedicated ${studentData.course} student with strong academic performance and active participation in extracurricular activities.`;
    }
  }

  async generateRecommendations(studentData) {
    try {
      const prompt = `
Based on the following student profile, provide 3-5 specific recommendations for professional development:

Student Profile:
- Course: ${studentData.course} - ${studentData.branch}
- CGPA: ${studentData.academicInfo?.cgpa}
- Activities: ${studentData.activities?.length || 0} activities
- Skills: ${studentData.skills?.join(', ') || 'Basic skills'}

Provide actionable recommendations for:
1. Skill development
2. Career preparation
3. Academic improvement
4. Professional networking

Return as a JSON array of recommendation strings.
`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const recommendations = JSON.parse(response.text());
      return recommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [
        'Focus on developing technical skills relevant to your field',
        'Participate in more industry-related workshops and seminars',
        'Build a strong professional network through LinkedIn and industry events',
        'Consider pursuing relevant certifications',
        'Engage in more hands-on projects to build practical experience'
      ];
    }
  }
}

module.exports = new AIService();
