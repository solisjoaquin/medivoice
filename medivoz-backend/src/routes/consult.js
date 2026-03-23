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
  const { query, url } = req.body

  if (!query) {
    return res.status(400).json({ error: 'Falta el campo "query"' })
  }

  const profile = readJSON('profile')

  // 1. Si hay URL, scrapear con Firecrawl
  let scrapedContent = ''
  if (url) {
    try {
      scrapedContent = await scrapeUrl(url)
    } catch (err) {
      console.warn('Firecrawl warning:', err.message)
      // No falla la consulta si el scraping falla
    }
  }

  // 2. Generar respuesta personalizada con Claude
  const textResponse = await generateMedicalResponse(query, profile, scrapedContent)

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
    },
    scrapedUrl: url || null,
  })
})

// POST /consult/text-only - sin audio (útil para desarrollo)
router.post('/text-only', async (req, res) => {
  const { query, url } = req.body

  if (!query) return res.status(400).json({ error: 'Falta "query"' })

  const profile = readJSON('profile')

  let scrapedContent = ''
  if (url) {
    try {
      scrapedContent = await scrapeUrl(url)
    } catch (err) {
      console.warn('Firecrawl warning:', err.message)
    }
  }

  const textResponse = await generateMedicalResponse(query, profile, scrapedContent)

  res.json({ ok: true, query, text: textResponse })
})

export default router
