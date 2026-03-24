import { Router } from 'express'
import { readJSON } from '../services/db.js'
// import { buildSystemPrompt } from '../services/gemini.js'

const router = Router()

// GET /agent/signed-url
router.get('/signed-url', async (req, res) => {
    try {
        const agentId = process.env.AGENT_ID
        const apiKey = process.env.ELEVENLABS_API_KEY

        if (!agentId || !apiKey) {
            return res.status(500).json({ error: 'Missing AGENT_ID or ELEVENLABS_API_KEY in environment' })
        }

        const response = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
            {
                headers: {
                    'xi-api-key': apiKey,
                },
            }
        )

        if (!response.ok) {
            const text = await response.text()
            return res.status(500).json({ error: 'Failed to get signed URL', details: text })
        }

        const data = await response.json()
        res.json({ signedUrl: data.signed_url, agentId })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// GET /agent/prompt
router.get('/prompt', async (req, res) => {
    try {
        const profile = readJSON('profile') || {}
        const doctor = readJSON('doctor') || {}

        const medications = (doctor.medications || [])
            .filter(m => m.assigned)
            .map(m => `${m.name}: ${m.description || ''}`)
            .concat(profile.medications || [])
            .join(', ')

        const studies = (doctor.studies || [])
            .filter(s => s.assigned)
            .map(s => `${s.name} (${s.date}): ${s.result}`)
            .join(' | ')

        const dynamicVariables = {
            patient_name: profile.name || 'Paciente',
            medications: medications || 'Ninguno',
            allergies: (profile.allergies || []).join(', ') || 'Ninguna',
            conditions: (profile.conditions || []).join(', ') || 'Ninguna',
            studies: studies || 'No hay estudios recientes'
        }

        res.json({ dynamicVariables })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

export default router
