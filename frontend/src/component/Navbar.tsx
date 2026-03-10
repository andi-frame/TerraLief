import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import './Navbar.css'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
            ✶
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
            <NavLink to="/" onClick={() => setIsMenuOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/shelters" onClick={() => setIsMenuOpen(false)}>
              Shelters
            </NavLink>
            <NavLink to="/routes" onClick={() => setIsMenuOpen(false)}>
              Routes
            </NavLink>
            <button type="button">Sign Up</button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar