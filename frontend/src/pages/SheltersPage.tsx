import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReliefMap from '../component/ReliefMap'
import ShelterDetailsSheet from '../component/ShelterDetailsSheet'
import { useShelters, useShelter } from '../hooks/useShelters'
import { ACEH_CENTER } from './mockData'
import './App.css'

function SheltersPage() {
  const navigate = useNavigate()
  const [selectedShelterId, setSelectedShelterId] = useState<string | null>(null)

  const { data: shelters = [], isLoading } = useShelters()
  const { data: shelterDetail } = useShelter(selectedShelterId ?? '')

  const shelterMarkers = useMemo(
    () =>
      shelters.map((shelter) => ({
        id: shelter.id,
        position: [shelter.lat, shelter.lng] as [number, number],
        kind: 'shelter' as const,
        title: shelter.name,
        subtitle: shelter.capacityStatus,
        popup: `${shelter.totalOccupants} people · ${shelter.capacityStatus}`,
        urgency: (shelter.capacityStatus === 'full' ? 'high'
          : shelter.capacityStatus === 'limited' ? 'medium' : 'low') as 'high' | 'medium' | 'low',
        count: shelter.totalOccupants,
        isActive: shelter.id === selectedShelterId,
        onClick: () => setSelectedShelterId(shelter.id),
      })),
    [shelters, selectedShelterId],
  )

  const selectedShelterPosition = shelters.find((s) => s.id === selectedShelterId)

  // Build the ShelterDetailsSheet-compatible object from the API response
  const selectedShelterData = shelterDetail
    ? {
        id: 0, // legacy number id — no longer used for navigation
        name: shelterDetail.name,
        location: shelterDetail.capacityStatus,
        count: shelterDetail.totalOccupants,
        urgency: (shelterDetail.capacityStatus === 'full' ? 'high'
          : shelterDetail.capacityStatus === 'limited' ? 'medium' : 'low') as 'high' | 'medium' | 'low',
        details: {
          occupancy: shelterDetail.population
            ? [
                { label: 'Male', value: shelterDetail.population.male },
                { label: 'Female', value: shelterDetail.population.female },
              ]
            : [],
          ageDistribution: shelterDetail.population
            ? [
                { label: 'Children (0–14)', value: shelterDetail.population.children },
                { label: 'Adults (15–64)', value: shelterDetail.totalOccupants - shelterDetail.population.children - shelterDetail.population.elderly },
                { label: 'Elderly (65+)', value: shelterDetail.population.elderly },
              ]
            : [],
          healthConditions: shelterDetail.population
            ? [{ label: 'Medical Attention Needed', value: shelterDetail.population.medical }]
            : [],
          currentNeeds: shelterDetail.needs.map((need) => ({
            label: need.item,
            value: `${need.quantity - need.fulfilled} ${need.priority} priority remaining`,
          })),
        },
      }
    : null

  return (
    <main className="shelters-map-page">
      <div className="shelters-map-canvas">
        <ReliefMap
          center={ACEH_CENTER}
          zoom={8}
          className="shelters-map-layer"
          markers={shelterMarkers}
          focusPosition={
            selectedShelterPosition
              ? [selectedShelterPosition.lat, selectedShelterPosition.lng]
              : null
          }
          focusZoom={selectedShelterId ? 10 : 8}
        />
      </div>

      <div className="shelters-ui-overlay">
        <div style={{ position: 'fixed', top: '132px', left: '1rem', right: '1rem', zIndex: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pointerEvents: 'none' }}>
          <div className="shelter-pill" style={{ position: 'static', transform: 'none' }}>Nearby Shelters</div>
          <button 
            type="button" 
            onClick={() => navigate('/shelters/create')}
            style={{
              pointerEvents: 'auto',
              background: '#0d2ee2',
              color: 'white',
              border: 'none',
              padding: '0.6rem 1rem',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
            }}
          >
            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span>
            Create Shelter
          </button>
        </div>

        <section className="shelter-floating-list" aria-label="Nearby shelters list">
          {isLoading && <p style={{ color: 'white', padding: '1rem' }}>Loading shelters...</p>}
          {shelters.map((shelter) => {
            const urgency = shelter.capacityStatus === 'full' ? 'high'
              : shelter.capacityStatus === 'limited' ? 'medium' : 'low'
            return (
              <button
                key={shelter.id}
                type="button"
                className={`shelter-floating-card ${selectedShelterId === shelter.id ? 'active' : ''}`}
                onClick={() => setSelectedShelterId(shelter.id)}
              >
                <h3>{shelter.name}</h3>
                <p>◎ {shelter.capacityStatus}</p>
                <div>
                  <span>⚇ {shelter.totalOccupants}</span>
                  <span className={`urgency ${urgency}`}>
                    ● {urgency[0].toUpperCase() + urgency.slice(1)} Urgency
                  </span>
                </div>
              </button>
            )
          })}
        </section>
      </div>

      <ShelterDetailsSheet
        shelter={selectedShelterData}
        onClose={() => setSelectedShelterId(null)}
        onDirections={(shelter) => {
          navigate('/routes/start', {
            state: { destinationShelterName: shelter.name },
          })
        }}
      />
    </main>
  )
}

export default SheltersPage