import { Router } from 'express'
import { readJSON, writeJSON } from '../services/db.js'
import { generateChatResponse, generateChatStream } from '../services/gemini.js'

const router = Router()

// GET /chat - obtener historial del chat
router.get('/', (req, res) => {
  const history = readJSON('chat')
  res.json(history)
})

// POST /chat - enviar mensaje
// Body: { message: string, role?: 'user' | 'doctor' }
router.post('/', async (req, res) => {
  const { message, role = 'user' } = req.body

  if (!message) return res.status(400).json({ error: 'Falta "message"' })

  const history = readJSON('chat')
  const profile = readJSON('profile')

  // Guardar mensaje del usuario
  const userMsg = {
    id: Date.now(),
    role,
    content: message,
    timestamp: new Date().toISOString(),
  }
  history.push(userMsg)

  // Si el mensaje es del usuario, generar respuesta de IA como asistente del médico
  if (role === 'user') {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    try {
      const stream = await generateChatStream(message, profile, history)
      let fullResponse = ''

      for await (const chunk of stream) {
        if (chunk.text) {
          fullResponse += chunk.text
          res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`)
        }
      }

      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: fullResponse,
        timestamp: new Date().toISOString(),
      }
      history.push(assistantMsg)
      writeJSON('chat', history)

      res.write(`data: [DONE]\n\n`)
      res.end()
    } catch (error) {
      console.error('Streaming error:', error)
      res.write(`data: ${JSON.stringify({ error: 'Streaming error' })}\n\n`)
      res.end()
    }
  } else {
    // Si el rol no es user, solo guardamos el mensaje
    writeJSON('chat', history)
    res.json({ ok: true, message: userMsg })
  }
})

// DELETE /chat - limpiar historial del chat
router.delete('/', (req, res) => {
  writeJSON('chat', [])
  res.json({ ok: true, message: 'Historial borrado' })
})

export default router
