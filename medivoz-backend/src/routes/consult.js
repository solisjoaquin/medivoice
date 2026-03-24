import { Router } from 'express'
import { readJSON } from '../services/db.js'
import { scrapeUrl } from '../services/firecrawl.js'
import { generateMedicalResponse } from '../services/gemini.js'

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

  res.json({
    ok: true,
    query,
    text: textResponse
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
