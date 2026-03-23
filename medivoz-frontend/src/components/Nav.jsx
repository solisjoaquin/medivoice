import { NavLink, useLocation } from 'react-router-dom'

const tabs = [
  { to: '/',        label: 'Consulta',  icon: '🎙️' },
  { to: '/profile', label: 'Mi perfil', icon: '🏥' },
  { to: '/chat',    label: 'Mi médico', icon: '💬' },
]

export default function Nav() {
  const location = useLocation()

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  return (
    <>
      {/* Desktop nav */}
      <nav className="nav">
        <NavLink to="/" className="nav-logo">
          <div className="nav-logo-mark">♥</div>
          <span className="nav-logo-text">MediVoz</span>
        </NavLink>

        <div className="nav-tabs">
          {tabs.map(t => (
            <NavLink
              key={t.to}
              to={t.to}
              className={`nav-tab ${isActive(t.to) ? 'active' : ''}`}
            >
              <span className="nav-tab-icon">{t.icon}</span>
              {t.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <div className="bottom-nav">
        <div className="bottom-nav-inner">
          {tabs.map(t => (
            <NavLink
              key={t.to}
              to={t.to}
              className={`bottom-nav-item ${isActive(t.to) ? 'active' : ''}`}
            >
              <span className="bottom-nav-item-icon">{t.icon}</span>
              <span className="bottom-nav-item-label">{t.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </>
  )
}
