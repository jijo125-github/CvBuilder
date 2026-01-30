import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import chatRouter from './routes/chat.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/chat', chatRouter)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Resume Builder API is running' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📝 API Health: http://localhost:${PORT}/api/health`)
})
