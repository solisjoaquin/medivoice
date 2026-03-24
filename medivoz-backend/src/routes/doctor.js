import { Router } from 'express'
import { readJSON, writeJSON } from '../services/db.js'
import { scrapeUrl } from '../services/firecrawl.js'
import crypto from 'crypto'

const router = Router()

function readDoctorDb() {
    try {
        return readJSON('doctor')
    } catch (e) {
        // If not exists, return default
        return { medications: [], studies: [] }
    }
}

function writeDoctorDb(data) {
    writeJSON('doctor', data)
}

// GET /doctor/medications
router.get('/medications', (req, res) => {
    const db = readDoctorDb()
    res.json(db.medications || [])
})

// POST /doctor/medications
router.post('/medications', async (req, res) => {
    const { name, description, url } = req.body
    if (!name) return res.status(400).json({ error: 'Missing name' })

    const db = readDoctorDb()
    const medication = {
        id: crypto.randomUUID(),
        name,
        description: description || '',
        url: url || '',
        scrapedContent: null,
        assigned: false,
        createdAt: new Date().toISOString()
    }

    if (url) {
        try {
            medication.scrapedContent = await scrapeUrl(url)
        } catch (e) {
            console.warn('Firecrawl warning on addMedication:', e.message)
            // Continue anyway but scrapedContent will be null
        }
    }

    if (!db.medications) db.medications = []
    db.medications.push(medication)
    writeDoctorDb(db)

    res.json(medication)
})

// DELETE /doctor/medications/:id
router.delete('/medications/:id', (req, res) => {
    const db = readDoctorDb()
    db.medications = (db.medications || []).filter(m => m.id !== req.params.id)
    writeDoctorDb(db)
    res.json({ ok: true })
})

// PATCH /doctor/medications/:id/assign
router.patch('/medications/:id/assign', (req, res) => {
    const { assigned } = req.body
    const db = readDoctorDb()
    const med = (db.medications || []).find(m => m.id === req.params.id)
    if (med) {
        med.assigned = Boolean(assigned)
        writeDoctorDb(db)
    }
    res.json({ ok: true })
})

// GET /doctor/studies
router.get('/studies', (req, res) => {
    const db = readDoctorDb()
    res.json(db.studies || [])
})

// POST /doctor/studies
router.post('/studies', (req, res) => {
    const { name, date, result, notes } = req.body
    if (!name || !result) return res.status(400).json({ error: 'Missing required fields (name, result)' })

    const db = readDoctorDb()
    const study = {
        id: crypto.randomUUID(),
        name,
        date: date || new Date().toISOString(),
        result,
        notes: notes || '',
        assigned: false,
        createdAt: new Date().toISOString()
    }

    if (!db.studies) db.studies = []
    db.studies.push(study)
    writeDoctorDb(db)

    res.json(study)
})

// DELETE /doctor/studies/:id
router.delete('/studies/:id', (req, res) => {
    const db = readDoctorDb()
    db.studies = (db.studies || []).filter(s => s.id !== req.params.id)
    writeDoctorDb(db)
    res.json({ ok: true })
})

// PATCH /doctor/studies/:id/assign
router.patch('/studies/:id/assign', (req, res) => {
    const { assigned } = req.body
    const db = readDoctorDb()
    const study = (db.studies || []).find(s => s.id === req.params.id)
    if (study) {
        study.assigned = Boolean(assigned)
        writeDoctorDb(db)
    }
    res.json({ ok: true })
})

export default router
