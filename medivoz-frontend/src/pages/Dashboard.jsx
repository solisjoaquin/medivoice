import React, { useState } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import ProfileDrawer from '../components/ProfileDrawer.jsx'
import ChatDrawer from '../components/ChatDrawer.jsx'
import VoiceAgent from '../components/VoiceAgent.jsx'
import { getMedications } from '../services/doctorApi.js'

export default function Dashboard() {
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [profileRefreshTrigger, setProfileRefreshTrigger] = useState(0)

    const [error, setError] = useState('')

    const [doctorMeds, setDoctorMeds] = useState([])

    React.useEffect(() => {
        getMedications().then(setDoctorMeds).catch(console.error)
    }, [])

    const handleProfileUpdated = () => {
        setProfileRefreshTrigger(prev => prev + 1)
    }

    // No longer using manual text queries, so we removed handleConsultSubmit and query state.

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

                    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', gridColumn: 'span 1' }}>
                        <VoiceAgent />
                    </div>

                    {error && (
                        <div className="col-span-full alert alert-error">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}
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
