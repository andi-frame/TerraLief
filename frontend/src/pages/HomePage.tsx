import { useState } from 'react'
import MapPlaceholder from '../component/MapPlaceholder'
import UrgencyLegend from '../component/UrgencyLegend'
import InfoCard from '../component/InfoCard'
import { useShelters } from '../hooks/useShelters'
import { ACEH_CENTER, LEGEND_ITEMS } from './mockData'
import './App.css'

function HomePage() {
  const [isAccessMenuOpen, setIsAccessMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('Flood')

  const { data: shelters = [], isLoading } = useShelters()

  // Derive map reports from shelters — each shelter is a pin on the map
  const mapReports = shelters.map((shelter, index) => ({
    id: index + 1,
    lat: shelter.lat,
    lng: shelter.lng,
    area: shelter.name,
    type: (shelter.disasterType === 'landslide' ? 'landslide' : 'flood') as 'flood' | 'landslide',
    urgency: 'medium' as const,
  }))

  const filteredReports = mapReports.filter(
    (report) => report.type.toLowerCase() === activeTab.toLowerCase(),
  )

  // Critical needs: shelters with high-priority unfulfilled needs
  // Derived from shelter list (needs come per-shelter in detail view)
  const nearbyShelters = shelters.slice(0, 5).map((shelter) => ({
    id: shelter.id,
    name: shelter.name,
    location: shelter.capacityStatus,
    count: shelter.totalOccupants,
    urgency: (shelter.capacityStatus === 'full' ? 'high'
      : shelter.capacityStatus === 'limited' ? 'medium' : 'low') as 'high' | 'medium' | 'low',
  }))

  return (
    <>
      <header className="hero-section">
        <div className="hero-content">
          <h1>What's Happening Around You?</h1>
          <p>Stay informed. Monitor active disaster reports and road access conditions near you.</p>
          <button type="button">Report Now</button>
        </div>
      </header>

      <main className="page-content">
        <section>
          <h2>
            Affected Area — 5 km <em>from You</em>
          </h2>
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

          <MapPlaceholder
            reports={isLoading ? [] : filteredReports}
            center={ACEH_CENTER}
          />
          <UrgencyLegend items={LEGEND_ITEMS} />
        </section>

        <section>
          <h3>Nearby Shelters</h3>
          {isLoading && <p className="section-description">Loading...</p>}
          {nearbyShelters.map((shelter) => (
            <InfoCard
              key={shelter.id}
              title={shelter.name}
              subtitle={`⚇ ${shelter.count} people · ${shelter.location}`}
              metaLeft={shelter.location}
              urgency={shelter.urgency}
            />
          ))}
        </section>
      </main>
    </>
  )
}

export default HomePage