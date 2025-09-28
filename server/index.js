const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const admin = require('firebase-admin');

// Load environment variables
dotenv.config();

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Middleware
const corsOrigin = process.env.CLIENT_URL || 'http://localhost:5175';
console.log('CORS Origin set to:', corsOrigin);
app.use(cors({
  origin: ['http://localhost:5175', 'http://localhost:5176'], // Allow both ports
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize Firebase Admin
try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://portfoliosite-abbff-default-rtdb.asia-southeast1.firebasedatabase.app"
  });
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/abc_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/students', require('./routes/students'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/activities', require('./routes/activities'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/qr', require('./routes/qrcode'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/portfolio', require('./routes/portfolio'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Mumbai University ABC App Backend is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
