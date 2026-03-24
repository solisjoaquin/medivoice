import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    getMedications, addMedication, deleteMedication, assignMedication,
    getStudies, addStudy, deleteStudy, assignStudy
} from '../services/doctorApi.js'
import { getProfile } from '../services/api.js'

export default function DoctorPage() {
    const navigate = useNavigate()

    const [medications, setMedications] = useState([])
    const [studies, setStudies] = useState([])
    const [profile, setProfile] = useState(null)
    const [loadingConfig, setLoadingConfig] = useState(true)

    // Medication Form
    const [medName, setMedName] = useState('')
    const [medDesc, setMedDesc] = useState('')
    const [medUrl, setMedUrl] = useState('')
    const [medScraping, setMedScraping] = useState(false)

    // Study Form
    const [studyName, setStudyName] = useState('')
    const [studyDate, setStudyDate] = useState('')
    const [studyResult, setStudyResult] = useState('')
    const [studyNotes, setStudyNotes] = useState('')
    const [studySaving, setStudySaving] = useState(false)

    useEffect(() => {
        Promise.all([getMedications(), getStudies(), getProfile()])
            .then(([m, s, p]) => {
                setMedications(m)
                setStudies(s)
                setProfile(p)
            })
            .catch(console.error)
            .finally(() => setLoadingConfig(false))
    }, [])

    const handleAddMedication = async (e) => {
        e.preventDefault()
        if (!medName) return
        setMedScraping(true)
        try {
            const data = await addMedication({ name: medName, description: medDesc, url: medUrl })
            setMedications(prev => [...prev, data])
            setMedName('')
            setMedDesc('')
            setMedUrl('')
        } catch (err) {
            alert(err.message)
        } finally {
            setMedScraping(false)
        }
    }

    const handleDeleteMedication = async (id) => {
        if (!confirm('Delete medication?')) return
        await deleteMedication(id)
        setMedications(prev => prev.filter(m => m.id !== id))
    }

    const handleAssignMedication = async (id, val) => {
        const backup = [...medications]
        setMedications(prev => prev.map(m => m.id === id ? { ...m, assigned: val } : m))
        try {
            await assignMedication(id, val)
        } catch (e) {
            alert('Error assigning medication')
            setMedications(backup)
        }
    }

    const handleAddStudy = async (e) => {
        e.preventDefault()
        if (!studyName || !studyResult) return
        setStudySaving(true)
        try {
            const data = await addStudy({ name: studyName, date: studyDate, result: studyResult, notes: studyNotes })
            setStudies(prev => [...prev, data])
            setStudyName('')
            setStudyDate('')
            setStudyResult('')
            setStudyNotes('')
        } catch (err) {
            alert(err.message)
        } finally {
            setStudySaving(false)
        }
    }

    const handleDeleteStudy = async (id) => {
        if (!confirm('Delete study?')) return
        await deleteStudy(id)
        setStudies(prev => prev.filter(s => s.id !== id))
    }

    const handleAssignStudy = async (id, val) => {
        const backup = [...studies]
        setStudies(prev => prev.map(s => s.id === id ? { ...s, assigned: val } : s))
        try {
            await assignStudy(id, val)
        } catch (e) {
            alert('Error assigning study')
            setStudies(backup)
        }
    }

    return (
        <div className="app-shell" style={{ display: 'flex', flexDirection: 'column' }}>

            {/* Header Doctor */}
            <header style={{
                background: 'var(--white)',
                borderBottom: '1px solid var(--slate-200)',
                padding: '16px 32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate('/')}>
                        ←
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--blue-900)' }}>MediVoice</h1>
                        <span className="tag" style={{ background: 'var(--success)', color: 'white', border: 'none' }}>👨‍⚕️ Doctor View</span>
                    </div>
                </div>

                <div style={{ fontSize: 14, color: 'var(--slate-600)' }}>
                    Patient: <strong>{profile?.name || 'My Profile'}</strong>
                </div>
            </header>

            <main className="main-content fade-up" style={{ padding: '32px', maxWidth: 1200 }}>

                {loadingConfig ? (
                    <div style={{ textAlign: 'center', padding: 80 }}>
                        <span className="spinner" style={{ color: 'var(--success)' }}></span>
                    </div>
                ) : (
                    <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>

                        {/* Panel Izquierdo: Medicamentos */}
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div>
                                <h2 className="card-title">Patient's medications</h2>
                                <p style={{ fontSize: 13, color: 'var(--slate-400)', marginTop: -8 }}>Add medication and scrape real package inserts.</p>
                            </div>

                            <form onSubmit={handleAddMedication} style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--slate-50)', padding: 16, borderRadius: 12 }}>
                                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--slate-600)' }}>＋ Add medication</h3>
                                <input className="input" placeholder="Name (e.g., Ibuprofen 400mg) *" value={medName} onChange={e => setMedName(e.target.value)} required />
                                <input className="input" placeholder="Short description (optional)" value={medDesc} onChange={e => setMedDesc(e.target.value)} />
                                <input className="input" type="url" placeholder="Package insert URL (optional)" value={medUrl} onChange={e => setMedUrl(e.target.value)} />

                                <button type="submit" className="btn" style={{ background: 'var(--success)', color: 'white' }} disabled={!medName || medScraping}>
                                    {medScraping ? (
                                        <><span className="spinner" /> Processing insert with Firecrawl...</>
                                    ) : 'Save medication'}
                                </button>
                            </form>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {medications.length === 0 && <p style={{ fontSize: 14, color: 'var(--slate-400)', textAlign: 'center' }}>No medications added.</p>}

                                {medications.map(m => (
                                    <div key={m.id} style={{ border: '1px solid var(--slate-200)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <h4 style={{ fontSize: 16, fontWeight: 600, color: 'var(--blue-900)' }}>{m.name}</h4>
                                                {m.description && <p style={{ fontSize: 13, color: 'var(--slate-600)', marginTop: 4 }}>{m.description}</p>}
                                            </div>
                                            <button className="tag-remove" onClick={() => handleDeleteMedication(m.id)}>✕</button>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            {m.scrapedContent ? (
                                                <span className="tag tag-green">✓ Insert loaded</span>
                                            ) : (
                                                <span className="tag tag-slate">No insert</span>
                                            )}
                                        </div>

                                        <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: 12, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                                                <input type="checkbox" checked={m.assigned} onChange={e => handleAssignMedication(m.id, e.target.checked)} style={{ accentColor: 'var(--success)', transform: 'scale(1.2)' }} />
                                                <span style={{ fontWeight: 500 }}>Assign to patient</span>
                                            </label>
                                            {m.assigned ? <span className="tag tag-blue" style={{ fontSize: 11 }}>Visible to AI</span> : <span className="tag tag-slate" style={{ fontSize: 11 }}>Not assigned</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Panel Derecho: Estudios */}
                        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                            <div>
                                <h2 className="card-title">Patient's studies</h2>
                                <p style={{ fontSize: 13, color: 'var(--slate-400)', marginTop: -8 }}>Add lab results or imaging.</p>
                            </div>

                            <form onSubmit={handleAddStudy} style={{ display: 'flex', flexDirection: 'column', gap: 12, background: 'var(--slate-50)', padding: 16, borderRadius: 12 }}>
                                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--slate-600)' }}>＋ Add study</h3>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <input className="input" placeholder="Name *" value={studyName} onChange={e => setStudyName(e.target.value)} style={{ flex: 1 }} required />
                                    <input className="input" type="date" value={studyDate} onChange={e => setStudyDate(e.target.value)} style={{ width: 140 }} />
                                </div>
                                <textarea className="input" placeholder="Result (free text) *" value={studyResult} onChange={e => setStudyResult(e.target.value)} rows={3} required style={{ resize: 'vertical' }} />
                                <textarea className="input" placeholder="Notes for patient (optional)" value={studyNotes} onChange={e => setStudyNotes(e.target.value)} rows={2} style={{ resize: 'vertical' }} />

                                <button type="submit" className="btn btn-secondary" disabled={!studyName || !studyResult || studySaving}>
                                    {studySaving ? <span className="spinner" /> : 'Save study'}
                                </button>
                            </form>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {studies.length === 0 && <p style={{ fontSize: 14, color: 'var(--slate-400)', textAlign: 'center' }}>No studies added.</p>}

                                {studies.map(s => (
                                    <div key={s.id} style={{ border: '1px solid var(--slate-200)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <h4 style={{ fontSize: 16, fontWeight: 600, color: 'var(--blue-900)' }}>{s.name}</h4>
                                                <p style={{ fontSize: 12, color: 'var(--slate-400)', marginTop: 2 }}>
                                                    {new Date(s.date).toLocaleDateString('en-US')}
                                                </p>
                                            </div>
                                            <button className="tag-remove" onClick={() => handleDeleteStudy(s.id)}>✕</button>
                                        </div>

                                        <div style={{ background: 'var(--slate-50)', padding: 12, borderRadius: 8, fontSize: 13, color: 'var(--slate-700)', fontStyle: 'italic' }}>
                                            "{s.result.length > 80 ? s.result.slice(0, 80) + '...' : s.result}"
                                        </div>

                                        <div style={{ borderTop: '1px solid var(--slate-100)', paddingTop: 12, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
                                                <input type="checkbox" checked={s.assigned} onChange={e => handleAssignStudy(s.id, e.target.checked)} style={{ accentColor: 'var(--blue-500)', transform: 'scale(1.2)' }} />
                                                <span style={{ fontWeight: 500 }}>Assign to patient</span>
                                            </label>
                                            {s.assigned ? <span className="tag tag-blue" style={{ fontSize: 11 }}>Visible to AI</span> : <span className="tag tag-slate" style={{ fontSize: 11 }}>Not assigned</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}
            </main>
        </div>
    )
}
