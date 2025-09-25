import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import authRouter from './routes/auth.js'
import connectToDatabase from './db/db.js'
import departmentRouter from './routes/department.js'
import employeeRouter from './routes/employee.js'
import salaryRouter from './routes/salary.js'  // Add this line

// Connect to database
connectToDatabase()

const app = express()
const __dirname = path.resolve()

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

app.use('/public', express.static(path.join(__dirname, 'public')))

app.use('/api/auth', authRouter)
app.use('/api/departments', departmentRouter)
app.use('/api/employees', employeeRouter)
app.use('/api/salary', salaryRouter)  // Add this line

app.get('/', (req, res) => {
  res.json({ message: 'Baobab Kindergarten API is running!' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack)
  res.status(500).json({
    success: false,
    error: 'Something went wrong!',
    message: err.message
  })
})

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`)
  console.log(`🌐 API available at: http://localhost:${PORT}`)
  console.log(`📁 Static files at: http://localhost:${PORT}/public`)
  console.log(`💰 Salary API at: http://localhost:${PORT}/api/salary`)
})