import { useMemo, useState } from 'react'
import ShelterDetailsSheet from '../component/ShelterDetailsSheet'
import { SHELTER_MAP_ITEMS } from './mockData'
import './App.css'

function SheltersPage() {
  const [selectedShelterId, setSelectedShelterId] = useState<number | null>(null)

  const selectedShelter = useMemo(
    () => SHELTER_MAP_ITEMS.find((shelter) => shelter.id === selectedShelterId) ?? null,
    [selectedShelterId],
  )

  return (
    <main className="shelters-map-page">
      {/* 1. Static Map Placeholder */}
      <div className="shelters-map-placeholder">
        <div className="placeholder-text">Interactive Map Placeholder</div>
        
        {/* Render static dots for the placeholder */}
        {SHELTER_MAP_ITEMS.map((shelter, index) => {
          // Fake percentages so the dots spread out nicely on the placeholder background
          const fakeTop = 25 + (index * 12) % 40; 
          const fakeLeft = 30 + (index * 20) % 50;

          return (
            <button
              key={shelter.id}
              type="button"
              className={`shelter-marker ${shelter.urgency}`}
              style={{ top: `${fakeTop}%`, left: `${fakeLeft}%` }}
              onClick={() => setSelectedShelterId(shelter.id)}
              aria-label={`View details for ${shelter.name}`}
            />
          )
        })}
      </div>

      {/* 2. The Floating UI Overlay (Hovering above the map) */}
      <div className="shelters-ui-overlay">
        <div className="shelter-pill">Nearby Shelters</div>

        <section className="shelter-floating-list" aria-label="Nearby shelters list">
          {SHELTER_MAP_ITEMS.map((shelter) => (
            <button
              key={shelter.id}
              type="button"
              className={`shelter-floating-card ${selectedShelterId === shelter.id ? 'active' : ''}`}
              onClick={() => setSelectedShelterId(shelter.id)}
            >
              <h3>{shelter.name}</h3>
              <p>◎ {shelter.location}</p>
              <div>
                <span>⚇ {shelter.count}</span>
                <span className={`urgency ${shelter.urgency}`}>
                  ● {shelter.urgency[0].toUpperCase() + shelter.urgency.slice(1)} Urgency
                </span>
              </div>
            </button>
          ))}
        </section>
      </div>

      {/* 3. The Modal Sheet */}
      <ShelterDetailsSheet shelter={selectedShelter} onClose={() => setSelectedShelterId(null)} />
    </main>
  )
}

export default SheltersPage