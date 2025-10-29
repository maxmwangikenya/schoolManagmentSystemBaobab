// index.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import connectToDatabase from './db/db.js';

// Import routes
import authRouter from './routes/auth.js';
import departmentRouter from './routes/department.js';
import employeeRouter from './routes/employee.js';
import salaryRouter from './routes/salary.js';
import leaveRouter from './routes/leave.js';
import reportRouter from './routes/report.js';
import payrollRouter from './routes/payroll.js';

// Connect to database
connectToDatabase();

// ✅ CREATE EXPRESS APP (BEFORE USING IT!)
const app = express();
const __dirname = path.resolve();

// Middleware
const allowedOrigins = [
  'https://school-managment-system-baobab.vercel.app',
  'http://localhost:5173',
  'https://school-managment-system-baobab-jvcs.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ============================================
// STATIC FILES & UPLOADS DIRECTORY
// ============================================
// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory:', uploadsDir);
}

// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Log static file attempts (helpful for debugging)
app.use((req, res, next) => {
  if (req.url.startsWith('/public') || req.url.startsWith('/uploads')) {
    console.log(`📁 Static file request: ${req.method} ${req.url}`);
  }
  next();
});

// API Routes (AFTER app is created)
app.use('/api/auth', authRouter);
app.use('/api/departments', departmentRouter);
app.use('/api/employees', employeeRouter);
app.use('/api/salary', salaryRouter); 
app.use('/api/leaves', leaveRouter);
app.use('/api/reports', reportRouter);
app.use('/api/payroll', payrollRouter);

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'Baobab Kindergarten API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      departments: '/api/departments',
      employees: '/api/employees',
      salary: '/api/salary',
      leaves: '/api/leaves',
      reports: '/api/reports',
      payroll: '/api/payroll'
    }
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uploadsPath: uploadsDir
  });
});

// Error handling middleware (must be after routes)
app.use((err, req, res, next) => {
  console.error('Error Stack:', err.stack);
  console.error('Error Message:', err.message);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler (must be last)
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: 'Route not found',
    method: req.method,
    path: req.originalUrl,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  process.exit(1);
});

export default app;