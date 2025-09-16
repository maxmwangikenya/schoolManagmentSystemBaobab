import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth.js'
import connectToDatabase from './db/db.js'
import departmentRouter from './routes/department.js'

// Connect to database
connectToDatabase()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes login
app.use('/api/auth', authRouter)
app.use('/api/departments', departmentRouter)

// Basic health check route
app.get('/', (req, res) => {
  res.json({ message: 'Baobab Kindergarten API is running!' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    success: false, 
    error: 'Something went wrong!' 
  })
})

// Handle 404 routes
app.use(/(.*)/, (req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found' 
  })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})