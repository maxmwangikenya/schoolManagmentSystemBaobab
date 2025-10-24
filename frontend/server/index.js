// index.js
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

// Static files
app.use('/public', express.static(path.join(__dirname, 'public')));

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
  console.log(`    ├─ Get all salaries: GET /api/salary`);
  console.log(`    ├─ Add salary: POST /api/salary/add`);
  console.log(`    ├─ Salary history: GET /api/salary/history/:employeeId`);
  console.log(`    ├─ Salary summary: GET /api/salary/summary/:employeeId`);
  console.log(`    └─ Department stats: GET /api/salary/department/:departmentId/stats`);
  console.log(`  Leaves: http://localhost:${PORT}/api/leaves`);
  console.log(`  Reports: http://localhost:${PORT}/api/reports`);
  console.log(`    ├─ All leave reports: GET /api/reports/leaves`);
  console.log(`    │   ├─ Filter by status: ?status=Approved`);
  console.log(`    │   ├─ Filter by department: ?department=DEPT_ID`);
  console.log(`    │   ├─ Filter by date range: ?startDate=2025-01-01&endDate=2025-01-31`);
  console.log(`    │   └─ Filter by leave type: ?leaveType=Sick Leave`);
  console.log(`    ├─ Leave statistics: GET /api/reports/leaves/statistics`);
  console.log(`    │   └─ Filter: ?year=2025&month=10&departmentId=DEPT_ID`);
  console.log(`    ├─ Department summary: GET /api/reports/leaves/department-summary`);
  console.log(`    └─ Employee report: GET /api/reports/leaves/employee/:employeeId`);
  console.log(`  Payroll: http://localhost:${PORT}/api/payroll`);
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