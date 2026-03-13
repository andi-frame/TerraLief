import { useState } from 'react'
import MapPlaceholder from '../component/MapPlaceholder'
import UrgencyLegend from '../component/UrgencyLegend'
import InfoCard from '../component/InfoCard'
import { ACEH_CENTER, CRITICAL_NEEDS, LEGEND_ITEMS, MAP_REPORTS, SHELTERS } from './mockData'
import './App.css'

function HomePage() {
  const [isAccessMenuOpen, setIsAccessMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('Flood')

  const filteredReports = MAP_REPORTS.filter(
    (report) => report.type.toLowerCase() === activeTab.toLowerCase(),
  )

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

          <MapPlaceholder reports={filteredReports} center={ACEH_CENTER} />
          <UrgencyLegend items={LEGEND_ITEMS} />
        </section>

        <section>
          <h3>Critical Needs in This Area</h3>
          {CRITICAL_NEEDS.map((need) => (
            <InfoCard
              key={need.id}
              title={need.title}
              subtitle={need.description}
              metaLeft={`${need.locations} locations`}
              urgency={need.urgency}
            />
          ))}
        </section>

        <section>
          <h3>Nearby Shelters</h3>
          {SHELTERS.map((shelter) => (
            <InfoCard
              key={shelter.id}
              title={shelter.name}
              subtitle={`◉ ${shelter.location}`}
              metaLeft={`${shelter.count} people`}
              urgency={shelter.urgency}
            />
          ))}
        </section>
      </main>
    </>
  )
}

export default HomePage