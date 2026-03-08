import { useState } from 'react'
import './App.css'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAccessMenuOpen, setIsAccessMenuOpen] = useState(true)

  return (
    <div className="home-page">
      <header className="hero-section">
        <div className={`top-nav ${isMenuOpen ? 'expanded' : ''}`}>
          <div className="top-nav-bar">
            <button className="logo-mark" type="button" aria-label="TerraLief home">
              ✶
            </button>
            <button
              className="menu-toggle"
              type="button"
              onClick={() => setIsMenuOpen((previous) => !previous)}
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {isMenuOpen ? '✕' : '☰'}
            </button>
          </div>

          {isMenuOpen && (
            <nav className="top-nav-menu" aria-label="Main navigation">
              <a href="#">Home</a>
              <a href="#">Shelters</a>
              <a href="#">Routes</a>
              <button type="button">Sign Up</button>
            </nav>
          )}
        </div>

        <div className="hero-content">
          <h1>What’s Happening Around You?</h1>
          <p>
            Stay informed. Monitor active disaster reports and road access conditions near
            you.
          </p>
          <button type="button">Report Now</button>
        </div>
      </header>

      <main className="page-content">
        <section>
          <h2>
            Affected Area — 5 km <em>from You</em>
          </h2>
          <p className="section-description">
            View active disaster reports, access conditions, and urgency levels in this zone.
          </p>

          <div className="map-controls">
            <div className="access-control">
              <button
                className="access-trigger"
                type="button"
                onClick={() => setIsAccessMenuOpen((previous) => !previous)}
                aria-expanded={isAccessMenuOpen}
              >
                Access Status <span>{isAccessMenuOpen ? '⌃' : '⌄'}</span>
              </button>
              {isAccessMenuOpen && (
                <div className="access-dropdown">
                  <button type="button">Safe to pass</button>
                  <button type="button">Restricted access</button>
                </div>
              )}
            </div>
            <div className="map-tabs">
              <button className="active" type="button">
                Flood
              </button>
              <button type="button">Landslide</button>
            </div>
          </div>

          <div className="map-placeholder" role="img" aria-label="Map placeholder">
            <span className="pin red" />
            <span className="pin green first" />
            <span className="pin green second" />
            <span className="pin green third" />
            <span className="pin blue" />
            <div>Map placeholder — API data and custom symbols will be integrated later.</div>
          </div>

          <div className="legend-card">
            <p>
              <span className="dot red" /> High Urgency Level
              <em>Immediate assistance required</em>
            </p>
            <p>
              <span className="dot yellow" /> Medium Urgency Level
              <em>Assistance needed soon</em>
            </p>
            <p>
              <span className="dot green" /> Low Urgency Level
              <em>Situation under monitoring</em>
            </p>
          </div>
        </section>

        <section>
          <h3>Critical Needs in This Area</h3>
          <article className="info-card">
            <h4>Clean Water</h4>
            <p>Needed for 120 people</p>
            <div>
              <span>3 locations</span>
              <span className="urgency high">● High Urgency</span>
            </div>
          </article>
          <article className="info-card">
            <h4>Medical Kits</h4>
            <p>Low stock, required within 24 hrs.</p>
            <div>
              <span>2 shelters</span>
              <span className="urgency high">● High Urgency</span>
            </div>
          </article>
        </section>

        <section>
          <h3>Nearby Shelters</h3>
          <article className="info-card">
            <h4>Hilltop Evacuation Center</h4>
            <p>◉ Hill District</p>
            <div>
              <span>110</span>
              <span className="urgency high">● High Urgency</span>
            </div>
          </article>
          <article className="info-card">
            <h4>Hilltop Evacuation Center</h4>
            <p>◉ Hill District</p>
            <div>
              <span>72</span>
              <span className="urgency medium">● Medium Urgency</span>
            </div>
          </article>
          <article className="info-card">
            <h4>Hilltop Evacuation Center</h4>
            <p>◉ Hill District</p>
            <div>
              <span>45</span>
              <span className="urgency low">● Low Urgency</span>
            </div>
          </article>
        </section>
      </main>

      <section className="note-section">
        <div className="note-icon" />
        <p>
          Information is based on community reports and AI analysis. Always follow official
          emergency guidance.
        </p>
      </section>

      <footer>© 2026 TerraLief. All rights reserved.</footer>
    </div>
  )
}

export default App
