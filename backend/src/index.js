const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const fileRoutes = require('./routes/fileRoutes');
const cleanupJob = require('./utils/cleanupJob');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
// });

// CORS configuration - ALLOW YOUR NETLIFY FRONTEND
const corsOptions = {
  origin: [
    'https://dropyourfiles.netlify.app', // Your Netlify frontend
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000', // Create React App dev server
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions)); // Use the specific CORS options
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use('/api', limiter);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/files', fileRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test route to verify CORS
app.get('/api/test-cors', (req, res) => {
  res.json({ 
    message: 'CORS is working!',
    allowedOrigins: corsOptions.origin,
    frontend: 'https://dropyourfiles.netlify.app'
  });
});

// Start server
connectDB().then(() => {
  // Start cleanup job
  cleanupJob.start();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Uploads directory: ${__dirname}/../uploads`);
    console.log(`CORS enabled for: ${corsOptions.origin.join(', ')}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
