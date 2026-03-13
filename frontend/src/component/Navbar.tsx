import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <nav className="site-navbar" aria-label="Main navigation">
      <div className={`site-navbar__inner ${isMenuOpen ? 'is-open' : ''}`}>
        <div className="site-navbar__bar">
          <NavLink
            to="/"
            className="site-navbar__logo"
            onClick={() => setIsMenuOpen(false)}
            aria-label="TerraLief home"
          >
            <img className="site-navbar__logo" src='/terralieflogo.svg' alt="TerraLief logo" />
          </NavLink>
          <button
            className="site-navbar__toggle"
            type="button"
            onClick={() => setIsMenuOpen((previous) => !previous)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {isMenuOpen && (
          <div className="site-navbar__panel">
            <NavLink to="/report-road" className="report-link" onClick={() => setIsMenuOpen(false)}>
              Report Road Condition
            </NavLink>
            <NavLink to="/" onClick={() => setIsMenuOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/shelters" onClick={() => setIsMenuOpen(false)}>
              Shelters
            </NavLink>
            <NavLink to="/routes" onClick={() => setIsMenuOpen(false)}>
              Routes
            </NavLink>
            {isLoggedIn ? (
              <button
                type="button"
                className="signup-btn"
                onClick={() => {
                  void logout().then(() => navigate('/auth'))
                  setIsMenuOpen(false)
                }}
              >
                Logout
              </button>
            ) : (
              <button
                type="button"
                className="signup-btn"
                onClick={() => {
                  navigate('/auth')
                  setIsMenuOpen(false)
                }}
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar