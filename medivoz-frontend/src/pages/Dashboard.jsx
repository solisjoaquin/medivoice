import React, { useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import ProfileDrawer from '../components/ProfileDrawer.jsx'
import ChatDrawer from '../components/ChatDrawer.jsx'
import AudioPlayer from '../components/AudioPlayer.jsx'
import { consult, consultText } from '../services/api.js'
import { getMedications } from '../services/doctorApi.js'

export default function Dashboard() {
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [profileRefreshTrigger, setProfileRefreshTrigger] = useState(0)

    const [query, setQuery] = useState('')
    const [url, setUrl] = useState('')
    const [textOnly, setTextOnly] = useState(false)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')

    const [doctorMeds, setDoctorMeds] = useState([])

    React.useEffect(() => {
        getMedications().then(setDoctorMeds).catch(console.error)
    }, [])

    const handleProfileUpdated = () => {
        setProfileRefreshTrigger(prev => prev + 1)
    }

    const handleConsultSubmit = async () => {
        if (!query.trim()) return
        setLoading(true)
        setError('')
        setResult(null)
        try {
            const fn = textOnly ? consultText : consult
            const data = await fn(query.trim(), url.trim() || undefined)
            setResult(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const activeMeds = doctorMeds.filter(m => m.assigned)
    const suggestedTags = activeMeds.length > 0
        ? activeMeds.slice(0, 4).map(m => m.name)
        : ['Ibuprofen', 'Omeprazole', 'Amoxicillin']

    return (
        <div className="app-shell">
            <Sidebar
                onOpenProfile={() => setIsProfileOpen(true)}
                onOpenChat={() => setIsChatOpen(true)}
                profileRefreshTrigger={profileRefreshTrigger}
            />

            <main className="main-content fade-up">
                <header style={{ marginBottom: 32 }}>
                    <h1 className="section-title">Hello, Patient 👋</h1>
                    <p className="section-subtitle">Your medical records and AI assistant in one place</p>
                </header>

                <div className="dashboard-grid">

                    {/* Card 1: Próxima consulta */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <h2 className="card-title" style={{ fontSize: 18, marginBottom: 8 }}>Your next appointment</h2>
                        <p style={{ color: 'var(--slate-600)', fontSize: 14, marginBottom: 24, flex: 1 }}>
                            Monday, April 15, 10:30 AM <br />
                            Dr. Martinez (Cardiology)
                        </p>
                        <button className="btn btn-secondary btn-full">
                            Schedule next appointment
                        </button>
                    </div>

                    {/* Card 2: Consultá a tu IA médica */}
                    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <h2 className="card-title" style={{ fontSize: 18, marginBottom: 12 }}>Ask your medical AI</h2>

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                            {suggestedTags.map(tag => (
                                <button
                                    key={tag}
                                    className="tag tag-green"
                                    style={{ cursor: 'pointer', border: 'none' }}
                                    onClick={() => setQuery(`Can I take ${tag} with my current medication?`)}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>

                        <div className="input-group" style={{ marginBottom: 16 }}>
                            <textarea
                                className="input"
                                placeholder="e.g., What are the side effects of omeprazole?"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                rows={2}
                                style={{ resize: 'none' }}
                            />
                        </div>

                        {/* <div className="input-group" style={{ marginBottom: 16 }}>
                            <input
                                className="input"
                                type="url"
                                placeholder="Package insert URL (optional)"
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                            />
                        </div> */}

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--slate-600)', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={textOnly}
                                    onChange={e => setTextOnly(e.target.checked)}
                                    style={{ accentColor: 'var(--blue-500)' }}
                                />
                                Text only
                            </label>

                            <button
                                className="btn btn-primary"
                                onClick={handleConsultSubmit}
                                disabled={loading || !query.trim()}
                            >
                                {loading ? <><span className="spinner" /> Asking...</> : <><span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mic-icon lucide-mic"><path d="M12 19v3" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><rect x="9" y="2" width="6" height="13" rx="3" /></svg></span> Ask</>}
                            </button>
                        </div>
                    </div>

                    {/* Card 3: Error */}
                    {error && (
                        <div className="col-span-full alert alert-error">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Card 4: Tus resultados */}
                    <div className="card col-span-full">
                        <h2 className="card-title" style={{ fontSize: 18, marginBottom: 16 }}>Your results</h2>

                        {!result && !loading && (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--slate-400)' }}>
                                <div style={{ fontSize: 40, marginBottom: 12 }}>🎧</div>
                                <p style={{ fontSize: 15 }}>Your personalized answer will appear here</p>
                            </div>
                        )}

                        {loading && (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <span className="spinner" style={{ width: 32, height: 32, color: 'var(--blue-400)' }} />
                                <p style={{ marginTop: 12, color: 'var(--slate-600)' }}>Generating your medical answer...</p>
                            </div>
                        )}

                        {result && !loading && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                {result.audio ? (
                                    <AudioPlayer base64={result.audio.base64} mimeType={result.audio.mimeType} text={result.text} />
                                ) : (
                                    <div style={{ padding: 20, background: 'var(--slate-50)', borderRadius: 12, border: '1px solid var(--slate-200)' }}>
                                        <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--slate-700)' }}>{result.text}</p>
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                    <button className="btn btn-secondary btn-sm" onClick={() => { setResult(null); setQuery(''); setUrl('') }}>
                                        New question
                                    </button>
                                    <button className="btn btn-primary btn-sm" onClick={() => setIsChatOpen(true)}>
                                        💬 Still have questions? Talk to your doctor
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <ProfileDrawer
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                onProfileUpdated={handleProfileUpdated}
            />
            <ChatDrawer
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
            />
        </div>
    )
}
