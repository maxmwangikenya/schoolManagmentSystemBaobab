// server.js (or index.js)
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import connectToDatabase from './db/db.js';

// Import routes
import authRouter from './routes/auth.js';
import departmentRouter from './routes/department.js';
import employeeRouter from './routes/employee.js';
import salaryRouter from './routes/salary.js';
import leaveRouter from './routes/leave.js';

// Connect to database
connectToDatabase();

const app = express();
const __dirname = path.resolve();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/departments', departmentRouter);
app.use('/api/employees', employeeRouter);
app.use('/api/salary', salaryRouter);
app.use('/api/leaves', leaveRouter);

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
      leaves: '/api/leaves'
    }
  });
});

// API health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
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
  console.log('=================================');
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API: http://localhost:${PORT}`);
  console.log(`Static files: http://localhost:${PORT}/public`);
  console.log('=================================');
  console.log('Available routes:');
  console.log(`  Auth: http://localhost:${PORT}/api/auth`);
  console.log(`  Departments: http://localhost:${PORT}/api/departments`);
  console.log(`  Employees: http://localhost:${PORT}/api/employees`);
  console.log(`  Salary: http://localhost:${PORT}/api/salary`);
  console.log(`  Leaves: http://localhost:${PORT}/api/leaves`);
  console.log('=================================');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

export default app;