# 🚀 Quick Start Guide - Mumbai University ABC App

## ✅ What's Already Configured

- ✅ Firebase project connected (`portfoliosite-abbff`)
- ✅ All dependencies installed
- ✅ Environment files created
- ✅ Service account key configured
- ✅ Directory structure set up

## 🎯 Ready to Run!

### 1. Start MongoDB (if using local)
```bash
# If you have MongoDB installed locally, start it
mongod
```

### 2. Run the Application
```bash
npm run dev
```

### 3. Open Your Browser
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔑 Demo Login Credentials

### Student Login
- **ABC ID**: ABC123456
- **Password**: student123

### Faculty Login
- Register using the faculty registration form

### Admin Login  
- Register using the admin registration form

## 📱 Features Available

### Student Dashboard
- Academic progress tracking
- Activity upload and management
- **AI-powered portfolio generation** (using Gemini AI)
- QR code attendance scanning
- Profile settings

### Faculty Dashboard
- Document verification
- Student performance monitoring
- QR code generation for classes

### Admin Dashboard
- Institutional analytics
- NAAC/NIRF report generation
- User management

## 🛠️ Troubleshooting

### If MongoDB connection fails:
1. Make sure MongoDB is running locally
2. Or update `server/.env` with your MongoDB Atlas connection string

### If Firebase authentication fails:
- Firebase is already configured with your project
- Make sure your Firebase project has Authentication enabled

### If you get port conflicts:
- Change ports in `server/.env` and `client/.env`

## 📚 Full Documentation
See `README.md` for complete setup and deployment instructions.

## 🎉 You're All Set!
The application is ready to use with all features implemented!
