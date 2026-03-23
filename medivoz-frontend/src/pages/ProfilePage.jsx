import { useState, useEffect } from 'react'
import { getProfile, addItem, deleteItem } from '../services/api.js'
import TagInput from '../components/TagInput.jsx'

const SECTIONS = [
  { key: 'medications', label: 'Medicamentos actuales',   icon: '💊', color: 'tag-blue',  placeholder: 'Ej: Ibuprofeno 400mg, Metformina 850mg' },
  { key: 'conditions',  label: 'Condiciones / diagnósticos', icon: '📋', color: 'tag-amber', placeholder: 'Ej: Diabetes tipo 2, Hipertensión' },
  { key: 'allergies',   label: 'Alergias',                icon: '⚠️', color: 'tag-red',   placeholder: 'Ej: Penicilina, Aspirina' },
  { key: 'studies',     label: 'Estudios / análisis',     icon: '🔬', color: 'tag-green', placeholder: 'Ej: Hemograma completo, Glucemia en ayunas' },
]

export default function ProfilePage() {
  const [profile,  setProfile]  = useState({ medications: [], conditions: [], allergies: [], studies: [] })
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState({})
  const [error,    setError]    = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    try {
      const data = await getProfile()
      setProfile(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAdd(section, item) {
    setSaving(s => ({ ...s, [section]: true }))
    try {
      const data = await addItem(section, item)
      setProfile(p => ({ ...p, [section]: data[section] }))
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(s => ({ ...s, [section]: false }))
    }
  }

  async function handleRemove(section, item) {
    try {
      const data = await deleteItem(section, item)
      setProfile(p => ({ ...p, [section]: data[section] }))
    } catch (err) {
      setError(err.message)
    }
  }

  const total = Object.values(profile).flat().length

  if (loading) return (
    <div className="page" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <span className="spinner" style={{ width: 32, height: 32, color: 'var(--blue-400)' }} />
    </div>
  )

  return (
    <div className="page fade-up">
      <div className="section-header">
        <div>
          <h1 className="section-title">Mi perfil médico</h1>
          <p className="section-subtitle">{total} {total === 1 ? 'dato registrado' : 'datos registrados'}</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: 20 }}>
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {SECTIONS.map(s => (
          <div className="card" key={s.key}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--blue-800)' }}>{s.label}</h2>
              {saving[s.key] && <span className="spinner" style={{ width: 14, height: 14, color: 'var(--blue-400)', marginLeft: 'auto' }} />}
            </div>
            <TagInput
              items={profile[s.key]}
              onAdd={item  => handleAdd(s.key, item)}
              onRemove={item => handleRemove(s.key, item)}
              placeholder={s.placeholder}
              colorClass={s.color}
            />
          </div>
        ))}
      </div>

      <div className="alert alert-info" style={{ marginTop: 24 }}>
        <span>💡</span>
        <span>Esta información se usa para personalizar tus consultas. Nunca se comparte con terceros.</span>
      </div>
    </div>
  )
}
