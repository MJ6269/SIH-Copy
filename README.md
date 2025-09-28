# Mumbai University ABC Management System

A comprehensive MERN stack web application for managing Mumbai University's Academic Bank of Credits (ABC) system. This application provides separate dashboards for students, faculty, and administrators with features like activity tracking, attendance management, portfolio generation, and analytics.

## Features

### Student Features
- **Dashboard**: Academic overview with progress tracking, attendance, and upcoming tasks
- **Activities**: Upload and track extracurricular activities, certificates, and achievements
- **Portfolio**: AI-generated professional portfolio based on academic and activity data
- **Attendance**: QR code scanning for class attendance
- **Settings**: Profile management and app preferences

### Faculty Features
- **Document Verification**: Review and approve student-uploaded activities and certificates
- **Student Performance**: Monitor student academic performance and attendance
- **QR Generator**: Generate QR codes for class attendance

### Admin Features
- **Analytics**: Comprehensive institutional analytics and reporting
- **NAAC/NIRF Reports**: Generate and manage institutional accreditation reports
- **User Management**: Manage all users (students, faculty, admin)

## Technology Stack

- **Frontend**: React.js, Tailwind CSS, Firebase Authentication
- **Backend**: Node.js, Express.js, MongoDB
- **Authentication**: Firebase Auth
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS
- **QR Code**: qrcode.react for generation, react-qr-scanner for scanning

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Firebase project setup
- Git

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mumbai-university-abc-app
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install all dependencies (root, server, and client)
npm run install-all
```

### 3. Environment Setup

#### Backend Environment (.env)
Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/abc_app
JWT_SECRET=your_jwt_secret_key_here
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLIENT_URL=http://localhost:3000
```

#### Frontend Environment (.env)
Create a `.env` file in the `client` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

### 4. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable Authentication and set up sign-in methods (Email/Password)
4. Get your Firebase configuration from Project Settings
5. For backend Firebase Admin SDK:
   - Go to Project Settings > Service Accounts
   - Generate a new private key
   - Use the downloaded JSON file values in your backend .env

### 5. MongoDB Setup

#### Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. The app will connect to `mongodb://localhost:27017/abc_app`

#### MongoDB Atlas (Cloud)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your backend .env file

### 6. Run the Application

#### Development Mode
```bash
# Run both frontend and backend concurrently
npm run dev
```

#### Individual Services
```bash
# Backend only
npm run server

# Frontend only
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
mumbai-university-abc-app/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── student/    # Student dashboard components
│   │   │   ├── faculty/    # Faculty dashboard components
│   │   │   ├── admin/      # Admin dashboard components
│   │   │   └── common/     # Shared components
│   │   ├── contexts/       # React contexts
│   │   ├── firebase/       # Firebase configuration
│   │   └── App.js
│   └── package.json
├── server/                 # Express backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── uploads/           # File uploads directory
│   ├── index.js           # Server entry point
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/verify-abc-id` - Verify ABC ID

### Activities
- `GET /api/activities/student` - Get student activities
- `POST /api/activities` - Create new activity
- `GET /api/activities/:id` - Get activity by ID
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity
- `GET /api/activities/faculty/pending` - Get pending activities for faculty
- `POST /api/activities/:id/verify` - Verify activity

### Attendance
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/student` - Get student attendance records

### QR Codes
- `POST /api/qr/generate` - Generate QR code
- `GET /api/qr/:id` - Get QR code details

### Analytics
- `GET /api/analytics` - Get institutional analytics

## Usage

### Student Login
1. Go to http://localhost:3000
2. Select "Student" tab
3. Use demo credentials:
   - ABC ID: ABC123456
   - Password: student123

### Faculty Login
1. Register as faculty using the hidden registration link
2. Or use admin panel to create faculty accounts

### Admin Login
1. Register as admin or use admin panel
2. Access full administrative features

## Features in Detail

### Student Dashboard
- Academic progress tracking
- Assignment status
- GPA and attendance display
- Upcoming tasks
- Weekly progress visualization

### Activities Management
- Upload certificates and documents
- Track activity status (pending, approved, rejected)
- Categorize activities (technical, leadership, academic, etc.)
- Faculty verification workflow

### Portfolio Generation
- AI-powered portfolio creation
- Automatic data aggregation from activities
- Professional presentation for employers
- Social links and contact information

### QR Attendance System
- Faculty generates QR codes for classes
- Students scan QR codes to mark attendance
- Real-time attendance tracking
- Location-based verification (optional)

### Faculty Tools
- Document verification interface
- Student performance monitoring
- QR code generation for classes
- Bulk verification capabilities

### Admin Analytics
- Institutional overview metrics
- Department-wise student distribution
- Activity type analysis
- NAAC/NIRF report generation
- User management system

## Development

### Adding New Features
1. Create components in appropriate directories
2. Add API routes in server/routes/
3. Update MongoDB models if needed
4. Test with both frontend and backend

### Database Models
- **User**: Basic user information and authentication
- **Student**: Student-specific data including ABC ID
- **Faculty**: Faculty information and class assignments
- **Activity**: Student activities and verification status
- **Attendance**: Attendance records with QR code tracking
- **QRCode**: Generated QR codes for classes
- **Portfolio**: AI-generated student portfolios

## Deployment

### Backend Deployment
1. Deploy to platforms like Heroku, Railway, or AWS
2. Set up MongoDB Atlas for production database
3. Configure environment variables
4. Set up file storage (Cloudinary for uploads)

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to platforms like Vercel, Netlify, or AWS S3
3. Configure environment variables
4. Update API URLs for production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

## Future Enhancements

- Mobile app development
- Advanced AI portfolio features
- Integration with university systems
- Real-time notifications
- Advanced analytics and reporting
- Multi-language support
- Offline functionality
#   S I H - M E R N - a p p  
 #   S I H - C o p y  
 