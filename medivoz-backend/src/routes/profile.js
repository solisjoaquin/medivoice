import { Router } from 'express'
import { readJSON, writeJSON } from '../services/db.js'

const router = Router()

// GET /profile - obtener historial completo
router.get('/', (req, res) => {
  const profile = readJSON('profile')
  res.json(profile)
})

// PUT /profile - reemplazar historial completo
router.put('/', (req, res) => {
  const { medications, conditions, allergies, studies } = req.body

  const profile = {
    medications: medications || [],
    conditions:  conditions  || [],
    allergies:   allergies   || [],
    studies:     studies     || [],
  }

  writeJSON('profile', profile)
  res.json({ ok: true, profile })
})

// PATCH /profile/:section - actualizar una sección específica
// sections: medications | conditions | allergies | studies
router.patch('/:section', (req, res) => {
  const { section } = req.params
  const allowed = ['medications', 'conditions', 'allergies', 'studies']

  if (!allowed.includes(section)) {
    return res.status(400).json({ error: `Sección inválida. Opciones: ${allowed.join(', ')}` })
  }

  const profile = readJSON('profile')
  profile[section] = req.body.items || []
  writeJSON('profile', profile)

  res.json({ ok: true, [section]: profile[section] })
})

// POST /profile/:section/add - agregar un ítem a una sección
router.post('/:section/add', (req, res) => {
  const { section } = req.params
  const allowed = ['medications', 'conditions', 'allergies', 'studies']

  if (!allowed.includes(section)) {
    return res.status(400).json({ error: `Sección inválida. Opciones: ${allowed.join(', ')}` })
  }

  const { item } = req.body
  if (!item) return res.status(400).json({ error: 'Falta el campo "item"' })

  const profile = readJSON('profile')
  if (!profile[section].includes(item)) {
    profile[section].push(item)
    writeJSON('profile', profile)
  }

  res.json({ ok: true, [section]: profile[section] })
})

// DELETE /profile/:section/:item - eliminar un ítem
router.delete('/:section/:item', (req, res) => {
  const { section, item } = req.params
  const allowed = ['medications', 'conditions', 'allergies', 'studies']

  if (!allowed.includes(section)) {
    return res.status(400).json({ error: `Sección inválida.` })
  }

  const profile = readJSON('profile')
  profile[section] = profile[section].filter(i => i !== decodeURIComponent(item))
  writeJSON('profile', profile)

  res.json({ ok: true, [section]: profile[section] })
})

export default router
