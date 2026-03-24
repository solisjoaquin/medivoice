import React, { useState, useEffect } from 'react'
import { getProfile, addItem, deleteItem } from '../services/api.js'
import TagInput from './TagInput.jsx'

const SECTIONS = [
    { key: 'medications', label: 'Current medications', icon: '💊', color: 'tag-blue', placeholder: 'e.g., Ibuprofen 400mg, Metformin 850mg' },
    { key: 'conditions', label: 'Conditions / diagnoses', icon: '📋', color: 'tag-amber', placeholder: 'e.g., Type 2 Diabetes, Hypertension' },
    { key: 'allergies', label: 'Allergies', icon: '⚠️', color: 'tag-red', placeholder: 'e.g., Penicillin, Aspirin' },
    { key: 'studies', label: 'Studies / lab results', icon: '🔬', color: 'tag-green', placeholder: 'e.g., Complete blood count, Fasting glucose' },
]

export default function ProfileDrawer({ isOpen, onClose, onProfileUpdated }) {
    const [profile, setProfile] = useState({ medications: [], conditions: [], allergies: [], studies: [] })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState({})
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen) {
            setLoading(true)
            load()
        }
    }, [isOpen])

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
            if (onProfileUpdated) onProfileUpdated()
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
            if (onProfileUpdated) onProfileUpdated()
        } catch (err) {
            setError(err.message)
        }
    }

    if (!isOpen) return null

    const total = Object.values(profile).flat().length

    return (
        <div className="drawer-overlay" onClick={onClose}>
            <div className="drawer-content" onClick={e => e.stopPropagation()}>
                <div className="drawer-header">
                    <div>
                        <h2 style={{ fontSize: 20, fontFamily: 'var(--font-display)', color: 'var(--blue-900)' }}>My medical profile</h2>
                        <p style={{ fontSize: 13, color: 'var(--slate-400)', marginTop: 2 }}>{total} saved records</p>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ fontSize: 20, padding: '4px 8px' }}>✕</button>
                </div>

                <div className="drawer-body">
                    {error && (
                        <div className="alert alert-error" style={{ marginBottom: 20 }}>
                            <span>⚠️</span><span>{error}</span>
                        </div>
                    )}

                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                            <span className="spinner" style={{ width: 32, height: 32, color: 'var(--blue-400)' }} />
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {SECTIONS.map(s => (
                                <div className="card" key={s.key} style={{ padding: 20 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                        <span style={{ fontSize: 20 }}>{s.icon}</span>
                                        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--blue-800)' }}>{s.label}</h3>
                                        {saving[s.key] && <span className="spinner" style={{ width: 14, height: 14, color: 'var(--blue-400)', marginLeft: 'auto' }} />}
                                    </div>
                                    <TagInput
                                        items={profile[s.key]}
                                        onAdd={item => handleAdd(s.key, item)}
                                        onRemove={item => handleRemove(s.key, item)}
                                        placeholder={s.placeholder}
                                        colorClass={s.color}
                                    />
                                </div>
                            ))}

                            <div className="alert alert-info" style={{ marginTop: 8 }}>
                                <span>💡</span>
                                <span>This information is used to personalize your consultations. It is never shared with third parties.</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
