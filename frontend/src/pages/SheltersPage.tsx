import { useMemo, useState } from 'react'
import ReliefMap from '../component/ReliefMap'
import ShelterDetailsSheet from '../component/ShelterDetailsSheet'
import { ACEH_CENTER, SHELTER_MAP_ITEMS } from './mockData'
import './App.css'

function SheltersPage() {
  const [selectedShelterId, setSelectedShelterId] = useState<number | null>(null)

  const selectedShelter = useMemo(
    () => SHELTER_MAP_ITEMS.find((shelter) => shelter.id === selectedShelterId) ?? null,
    [selectedShelterId],
  )

  const shelterMarkers = useMemo(
    () =>
      SHELTER_MAP_ITEMS.map((shelter) => ({
        id: shelter.id,
        position: shelter.latLng,
        kind: 'shelter' as const,
        title: shelter.name,
        subtitle: shelter.location,
        popup: `${shelter.count} people · ${shelter.urgency} urgency`,
        urgency: shelter.urgency,
        count: shelter.count,
        isActive: shelter.id === selectedShelterId,
        onClick: () => setSelectedShelterId(shelter.id),
      })),
    [selectedShelterId],
  )

  return (
    <main className="shelters-map-page">
      <div className="shelters-map-canvas">
        <ReliefMap
          center={ACEH_CENTER}
          zoom={8}
          className="shelters-map-layer"
          markers={shelterMarkers}
          focusPosition={selectedShelter?.latLng ?? null}
          focusZoom={selectedShelter ? 10 : 8}
        />
      </div>

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

      <ShelterDetailsSheet shelter={selectedShelter} onClose={() => setSelectedShelterId(null)} />
    </main>
  )
}

export default SheltersPage