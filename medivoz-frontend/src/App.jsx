import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav         from './components/Nav.jsx'
import ConsultPage from './pages/ConsultPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import ChatPage    from './pages/ChatPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Nav />
        <Routes>
          <Route path="/"        element={<ConsultPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/chat"    element={<ChatPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
