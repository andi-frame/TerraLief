import { useState } from 'react'
import './Navbar.css'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="site-navbar" aria-label="Main navigation">
      <div className={`site-navbar__inner ${isMenuOpen ? 'is-open' : ''}`}>
        <div className="site-navbar__bar">
          <button className="site-navbar__logo" type="button" aria-label="TerraLief home">
            ✶
          </button>
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
            <a href="#">Home</a>
            <a href="#">Shelters</a>
            <a href="#">Routes</a>
            <button type="button">Sign Up</button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar