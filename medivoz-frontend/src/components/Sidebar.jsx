import React, { useState, useEffect } from 'react'
import { getProfile } from '../services/api.js'
import { getMedications } from '../services/doctorApi.js'
import { useNavigate } from 'react-router-dom'

export default function Sidebar({ onOpenProfile, onOpenChat, profileRefreshTrigger }) {
    const navigate = useNavigate()
    const [profile, setProfile] = useState({ medications: [], conditions: [], allergies: [] })
    const [doctorMeds, setDoctorMeds] = useState([])

    useEffect(() => {
        getProfile().then(setProfile).catch(console.error)
        getMedications().then(setDoctorMeds).catch(console.error)
    }, [profileRefreshTrigger])

    return (
        <>
            <aside className="sidebar">
                <div className="sidebar-header">
                    {/* <div className="nav-logo-mark">💙</div> */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--success)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart-pulse-icon lucide-heart-pulse"><path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" /><path d="M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" /></svg>
                        <h3 style={{ fontSize: 18, color: 'var(--slate-900)', fontFamily: 'var(--font-display)' }}>Medivoice</h3>
                    </div>
                </div>

                <div className="sidebar-body">
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--blue-100)', color: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 16px', fontWeight: 600 }}>
                            MP
                        </div>
                        <h3 style={{ fontSize: 18, color: 'var(--slate-800)', fontFamily: 'var(--font-display)' }}>My Profile</h3>
                        <p style={{ fontSize: 13, color: 'var(--slate-400)', marginTop: 4 }}>Active patient</p>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <h4 style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--slate-400)', letterSpacing: '0.05em', marginBottom: 12, fontWeight: 600 }}>Medical Information</h4>
                        <div className="profile-stat" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                <span>Medications</span>
                                <span className="profile-stat-val">{(profile.medications?.length || 0) + doctorMeds.length}</span>
                            </div>
                            {doctorMeds.length > 0 && (
                                <div style={{ fontSize: 11, color: 'var(--slate-500)', marginTop: 8, lineHeight: 1.4 }}>
                                    <strong style={{ color: 'var(--slate-600)' }}>Doctor added:</strong> {doctorMeds.map(m => m.name).join(', ')}
                                </div>
                            )}
                        </div>
                        <div className="profile-stat" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                <span>Allergies</span>
                                <span className="profile-stat-val">{profile.allergies?.length || 0}</span>
                            </div>
                            {profile.allergies?.length > 0 && (
                                <div style={{ fontSize: 11, color: 'var(--slate-500)', marginTop: 8, lineHeight: 1.4 }}>
                                    {profile.allergies.join(', ')}
                                </div>
                            )}
                        </div>
                        <div className="profile-stat" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                                <span>Conditions</span>
                                <span className="profile-stat-val">{profile.conditions?.length || 0}</span>
                            </div>
                            {profile.conditions?.length > 0 && (
                                <div style={{ fontSize: 11, color: 'var(--slate-500)', marginTop: 8, lineHeight: 1.4 }}>
                                    {profile.conditions.join(', ')}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="sidebar-footer">
                    <button className="btn btn-secondary btn-full" onClick={onOpenProfile} style={{ marginBottom: 12 }}>
                        View full profile
                    </button>
                    <button className="btn btn-ghost btn-full" onClick={() => navigate('/doctor')} style={{ color: 'var(--success)' }}>
                        Doctor View →
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav className="bottom-nav">
                <div className="bottom-nav-inner">
                    <button className="bottom-nav-item active">
                        <span className="bottom-nav-item-icon">🎙️</span>
                        <span className="bottom-nav-item-label">Consult</span>
                    </button>
                    <button className="bottom-nav-item" onClick={onOpenChat}>
                        <span className="bottom-nav-item-icon">💬</span>
                        <span className="bottom-nav-item-label">Chat</span>
                    </button>
                    <button className="bottom-nav-item" onClick={onOpenProfile}>
                        <span className="bottom-nav-item-icon">👤</span>
                        <span className="bottom-nav-item-label">Profile</span>
                    </button>
                </div>
            </nav>
        </>
    )
}
