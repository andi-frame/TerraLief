import { useState } from 'react'
import './App.css'
import Navbar from './component/Navbar'

//data mock
//replace dengan API calls nanti
const LEGEND_ITEMS = [
  { id: 'high', color: 'red', label: 'High Urgency Level', subtext: 'Immediate assistance required' },
  { id: 'medium', color: 'yellow', label: 'Medium Urgency Level', subtext: 'Assistance needed soon' },
  { id: 'low', color: 'green', label: 'Low Urgency Level', subtext: 'Situation under monitoring' },
];

const CRITICAL_NEEDS = [
  { id: 1, title: 'Clean Water', description: 'Needed for 120 people', locations: 3, urgency: 'high' },
  { id: 2, title: 'Medical Kits', description: 'Low stock, required within 24 hrs.', locations: 2, urgency: 'high' },
];

const SHELTERS = [
  { id: 1, name: 'Hilltop Evacuation Center', location: 'Hill District', count: 110, urgency: 'high' },
  { id: 2, name: 'North Valley Shelter', location: 'Valley Pass', count: 72, urgency: 'medium' },
  { id: 3, name: 'Downtown Community Hub', location: 'Central Square', count: 45, urgency: 'low' },
];

//Mock api calls untuk maps
const MAP_REPORTS = [
  { id: 1, lat: 20, lng: 67, type: 'flood', urgency: 'high' },
  { id: 2, lat: 38, lng: 56, type: 'flood', urgency: 'low' },
  { id: 3, lat: 35, lng: 49, type: 'landslide', urgency: 'medium' },
];

function App() {
  const [isAccessMenuOpen, setIsAccessMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Flood'); //state for tabs

  return (
    <div className="home-page">
      <Navbar />

      <header className="hero-section">
        <div className="hero-content">
          <h1>What’s Happening Around You?</h1>
          <p>Stay informed. Monitor active disaster reports and road access conditions near you.</p>
          <button type="button">Report Now</button>
        </div>
      </header>

      <main className="page-content">
        <section>
          <h2>Affected Area — 5 km <em>from You</em></h2>
          <p className="section-description">View active disaster reports and urgency levels.</p>

          <div className="map-controls">
            <div className="access-control">
              <button
                className="access-trigger"
                type="button"
                onClick={() => setIsAccessMenuOpen((prev) => !prev)}
                aria-expanded={isAccessMenuOpen}
              >
                Access Status 
                <img 
                  src="/arrow-up.svg" 
                  alt="" 
                  className={`arrow-icon ${isAccessMenuOpen ? 'is-flipped' : ''}`} 
                />
              </button>
              {isAccessMenuOpen && (
                <div className="access-dropdown">
                  <button type="button">Safe to pass</button>
                  <button type="button">Restricted access</button>
                </div>
              )}
            </div>

            <div className="map-tabs">
              {['Flood', 'Landslide'].map((tab) => (
                <button 
                  key={tab}
                  className={activeTab === tab ? 'active' : ''} 
                  type="button"
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="map-placeholder">
            <div className="placeholder-text">Interactive Map UI</div>
            
            {MAP_REPORTS.map((report) => (
              <div 
                key={report.id} 
                className={`custom-marker ${report.urgency}`}
                style={{ top: `${report.lat}%`, left: `${report.lng}%` }} 
              >
                {/* image marker based on type and urgency */}
                <img 
                  src={`/${report.type}marker.png`} 
                  alt={`${report.type} at ${report.urgency} urgency`} 
                />
              </div>
            ))}
          </div>

          <div className="legend-card">
            {LEGEND_ITEMS.map((item) => (
              <p key={item.id}>
                <div className="left-group">
                  <span className={`dot ${item.color}`} /> {item.label}
                </div>
                <em>{item.subtext}</em>
              </p>
            ))}
          </div>
        </section>

        <section>
          <h3>Critical Needs in This Area</h3>
          {CRITICAL_NEEDS.map((need) => (
            <article className="info-card" key={need.id}>
              <h4>{need.title}</h4>
              <p>{need.description}</p>
              <div>
                <span>{need.locations} locations</span>
                <span className={`urgency ${need.urgency}`}>● {need.urgency.charAt(0).toUpperCase() + need.urgency.slice(1)} Urgency</span>
              </div>
            </article>
          ))}
        </section>

        <section>
          <h3>Nearby Shelters</h3>
          {SHELTERS.map((shelter) => (
            <article className="info-card" key={shelter.id}>
              <h4>{shelter.name}</h4>
              <p>◉ {shelter.location}</p>
              <div>
                <span>{shelter.count} people</span>
                <span className={`urgency ${shelter.urgency}`}>● {shelter.urgency.charAt(0).toUpperCase() + shelter.urgency.slice(1)} Urgency</span>
              </div>
            </article>
          ))}
        </section>
      </main>

      <section className="note-section">
        <div className="note-icon" />
        <p>Information is based on community reports and AI analysis. Always follow official guidance.</p>
      </section>

      <footer>© 2026 TerraLief. All rights reserved.</footer>
    </div>
  )
}

export default App