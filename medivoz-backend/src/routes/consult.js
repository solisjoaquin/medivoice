import { Router } from 'express'
import { readJSON } from '../services/db.js'
import { scrapeUrl } from '../services/firecrawl.js'
import { generateMedicalResponse } from '../services/gemini.js'
import { textToSpeech } from '../services/elevenlabs.js'

const router = Router()

// POST /consult
// Body: { query: string, url?: string }
// Responde con JSON + audio en base64
router.post('/', async (req, res) => {
  const { query } = req.body

  if (!query) {
    return res.status(400).json({ error: 'Missing "query" field' })
  }

  const profile = readJSON('profile')
  const doctor = readJSON('doctor')

  const doctorData = {
    medications: (doctor.medications || []).filter(m => m.assigned),
    studies: (doctor.studies || []).filter(s => s.assigned)
  }

  // 2. Generar respuesta personalizada con Gemini
  const textResponse = await generateMedicalResponse(query, profile, '', doctorData)

  // 3. Convertir a audio con ElevenLabs
  const audioBuffer = await textToSpeech(textResponse)
  const audioBase64 = audioBuffer.toString('base64')

  res.json({
    ok: true,
    query,
    text: textResponse,
    audio: {
      base64: audioBase64,
      mimeType: 'audio/mpeg',
    }
  })
})

// POST /consult/text-only - sin audio (útil para desarrollo)
router.post('/text-only', async (req, res) => {
  const { query } = req.body

  if (!query) return res.status(400).json({ error: 'Missing "query" field' })

  const profile = readJSON('profile')
  const doctor = readJSON('doctor')

  const doctorData = {
    medications: (doctor.medications || []).filter(m => m.assigned),
    studies: (doctor.studies || []).filter(s => s.assigned)
  }

  const textResponse = await generateMedicalResponse(query, profile, '', doctorData)

  res.json({ ok: true, query, text: textResponse })
})

export default router
