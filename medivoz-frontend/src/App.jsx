import React, { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import DoctorPage from './pages/DoctorPage.jsx'

export default function App() {
  const [showBanner, setShowBanner] = useState(true)

  return (
    <BrowserRouter>
      {showBanner && (
        <div style={{
          background: '#fffbeb',
          color: '#92400e',
          padding: '10px 20px',
          textAlign: 'center',
          fontSize: '13px',
          fontWeight: '500',
          borderBottom: '1px solid #fde68a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          position: 'relative'
        }}>
          <span>⚠️</span>
          <span>The app might not work due to missing tokens. Please clone the repository and set your own API keys to use it.</span>
          <button 
            onClick={() => setShowBanner(false)}
            style={{
              position: 'absolute',
              right: '16px',
              background: 'none',
              border: 'none',
              color: '#92400e',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/doctor" element={<DoctorPage />} />
      </Routes>
    </BrowserRouter>
  )
}
