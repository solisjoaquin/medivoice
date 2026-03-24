import 'dotenv/config'
import 'express-async-errors'
import express from 'express'
import cors from 'cors'

import profileRoutes from './routes/profile.js'
import consultRoutes from './routes/consult.js'
import chatRoutes from './routes/chat.js'
import doctorRoutes from './routes/doctor.js'
import agentRoutes from './routes/agent.js'

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'MediVoz API',
    version: '1.0.0',
    time: new Date().toISOString(),
  })
})

// Rutas
app.use('/profile', profileRoutes)
app.use('/consult', consultRoutes)
app.use('/chat', chatRoutes)
app.use('/doctor', doctorRoutes)
app.use('/agent', agentRoutes)

// Error handler global
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message)
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message,
  })
})

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════╗
  ║   🏥 MediVoz API corriendo       ║
  ║   http://localhost:${PORT}         ║
  ╚══════════════════════════════════╝

  Endpoints disponibles:
  GET  /health
  GET  /profile
  PUT  /profile
  PATCH /profile/:section
  POST /profile/:section/add
  DELETE /profile/:section/:item

  POST /consult            → audio + texto
  POST /consult/text-only  → solo texto

  GET  /chat
  POST /chat
  DELETE /chat

  GET /agent/signed-url
  GET /agent/prompt
  `)
})
