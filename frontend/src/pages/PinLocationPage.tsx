import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ReliefMap from '../component/ReliefMap'
import { ACEH_CENTER } from './mockData'

function PinLocationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Preserve form state from the navigation
  const formState = location.state?.formData || {}
  
  const initialPos = formState.lat && formState.lng 
    ? [formState.lat, formState.lng] as [number, number]
    : ACEH_CENTER

  const [pinPos, setPinPos] = useState<[number, number] | null>(
    formState.lat && formState.lng ? [formState.lat, formState.lng] : null
  )

  const handleConfirm = () => {
    if (pinPos) {
      navigate('/shelters/create', { state: { ...formState, lat: pinPos[0], lng: pinPos[1] } })
    }
  }

  const handleCancel = () => {
    // Navigate back to form without changing lat/lng
    navigate('/shelters/create', { state: formState })
  }

  const markers = pinPos ? [{
    id: 'draft-pin',
    position: pinPos,
    kind: 'shelter' as const,
    title: formState.name || 'New Shelter',
    popup: 'Pinned Location',
  }] : []

  return (
    <main style={{ height: '100vh', display: 'flex', flexDirection: 'column', paddingTop: '5rem', boxSizing: 'border-box' }}>
      <header style={{
        padding: '1rem', 
        background: 'white', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        zIndex: 10,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <button 
          onClick={handleCancel}
          style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer' }}
        >
          Cancel
        </button>
        <h1 style={{ fontSize: '1.1rem', margin: 0, color: '#0d2ee2' }}>Pin Location</h1>
        <button 
          onClick={handleConfirm}
          disabled={!pinPos}
          style={{ 
            background: pinPos ? '#0d2ee2' : '#ccc', 
            color: 'white', 
            border: 'none', 
            padding: '0.5rem 1rem', 
            borderRadius: '20px',
            cursor: pinPos ? 'pointer' : 'not-allowed'
          }}
        >
          Confirm
        </button>
      </header>

      <div style={{ flex: 1, position: 'relative' }}>
        <ReliefMap
          center={initialPos}
          zoom={12}
          onMapClick={setPinPos}
          markers={markers}
          className="report-road-map-layer"
        />
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '20px',
          zIndex: 1000,
          pointerEvents: 'none',
          fontSize: '0.9rem'
        }}>
          Tap anywhere on the map to place the pin
        </div>
      </div>
    </main>
  )
}

export default PinLocationPage
