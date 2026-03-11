import { useMemo } from 'react'
import ReliefMap, { type ReliefMarker } from '../component/ReliefMap'
import { ACEH_CENTER, MAP_REPORTS, ROUTE_PATH_POINTS, ROUTE_STOPS, SHELTER_MAP_ITEMS } from './mockData'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import './RoutesPage.css'

type SupplyRow = {
  item: string
  quantity: string
  unit: string
}

function RouteMapBackdrop({ withPath = false, withActivePin = false }: { withPath?: boolean; withActivePin?: boolean }) {
  const markers = useMemo<ReliefMarker[]>(() => {
    const disasterMarkers = MAP_REPORTS.slice(0, 4).map((report) => ({
      id: `report-${report.id}`,
      position: [report.lat, report.lng] as [number, number],
      kind: report.type,
      title: `${report.type[0].toUpperCase() + report.type.slice(1)} report`,
      subtitle: report.area,
      popup: `${report.urgency[0].toUpperCase() + report.urgency.slice(1)} urgency`,
      urgency: report.urgency,
    }))

    const shelterMarkers = SHELTER_MAP_ITEMS.slice(0, 3).map((shelter) => ({
      id: `shelter-${shelter.id}`,
      position: shelter.latLng,
      kind: 'shelter' as const,
      title: shelter.name,
      subtitle: shelter.location,
      popup: `${shelter.count} people waiting`,
      urgency: shelter.urgency,
      count: shelter.count,
    }))

    const routeMarkers = withPath
      ? ROUTE_STOPS.map((stop, index) => ({
          id: stop.id,
          position: stop.position,
          kind: 'route-stop' as const,
          title: stop.name,
          subtitle: stop.location,
          popup: stop.description,
          sequence: index + 1,
        }))
      : []

    const currentLocationMarker = withActivePin
      ? [
          {
            id: 'current-location',
            position: ROUTE_PATH_POINTS[0],
            kind: 'current-location' as const,
            title: 'Your current location',
            popup: 'Live volunteer location',
          },
        ]
      : []

    return [...disasterMarkers, ...shelterMarkers, ...routeMarkers, ...currentLocationMarker]
  }, [withActivePin, withPath])

  return (
    <ReliefMap
      center={ACEH_CENTER}
      zoom={8}
      clustered={!withPath}
      className="routes-map-layer"
      markers={markers}
      polyline={withPath ? ROUTE_PATH_POINTS : undefined}
      focusPosition={withPath ? ROUTE_PATH_POINTS[0] : null}
      focusZoom={withPath ? 10 : 8}
    />
  )
}

function RoutesLandingCard() {
  const navigate = useNavigate()

  return (
    <section className="routes-overlay-card routes-landing-card">
      <h1>Relief Routes</h1>
      <p>
        Find the most efficient routes to deliver aid to shelters or report road
        conditions to help other volunteers.
      </p>

      <button type="button" className="routes-primary-btn" onClick={() => navigate('/routes/find')}>
        Find Best Route
      </button>
      <button type="button" className="routes-secondary-btn">Report Road Condition</button>
      <button type="button" className="routes-link-btn" onClick={() => navigate('/routes/start')}>
        View Saved Routes
      </button>
    </section>
  )
}

function FindBestRouteCard() {
  const navigate = useNavigate()
  const supplies: SupplyRow[] = [
    { item: 'Food Packs', quantity: '20', unit: 'packs' },
    { item: 'Clean Water', quantity: '30', unit: 'liters' },
    { item: 'Medical Kits', quantity: '15', unit: 'kits' },
  ]

  return (
    <section className="routes-overlay-card routes-find-card">
      <h2>Find Best Aid Route</h2>

      <h3>Supplies You Carry</h3>
      <p className="routes-help-text">
        You can manually add items or upload a photo of your supply list for automatic
        detection.
      </p>

      <div className="routes-upload-box">
        <p>Upload an image or file of your supply list for automatic item detection.</p>
        <button type="button">Browse File</button>
      </div>

      <div className="routes-input-head">
        <span>Supply Item</span>
        <span>Quantity</span>
        <span>Unit</span>
      </div>
      <div className="routes-input-row">
        <input value="e.g., Clean Water" readOnly />
        <input value="e.g., 50" readOnly />
        <input value="e.g., liters" readOnly />
      </div>
      <button type="button" className="routes-add-btn">+</button>

      <h3>Vehicle Type</h3>
      <label><input type="radio" name="vehicle" /> Motorcycle</label>
      <label><input type="radio" name="vehicle" /> Car</label>
      <label><input type="radio" name="vehicle" /> Truck</label>

      <h3>Number of Shelters to Visit</h3>
      <select defaultValue="Auto">
        <option>Auto</option>
        <option>1</option>
        <option>2</option>
        <option>3</option>
      </select>

      <h3>Starting Point</h3>
      <label><input type="radio" name="starting" /> Current Location</label>
      <label><input type="radio" name="starting" /> Logistics Warehouse</label>

      <div className="routes-actions">
        <button type="button" className="routes-secondary-btn" onClick={() => navigate('/routes')}>
          Cancel
        </button>
        <button type="button" className="routes-primary-btn" onClick={() => navigate('/routes/best', { state: { supplies } })}>
          Find Route
        </button>
      </div>
    </section>
  )
}

function BestRouteCard() {
  const navigate = useNavigate()

  return (
    <section className="routes-bottom-sheet">
      <div className="routes-chip">3 Recommended Routes</div>

      <article className="routes-route-card">
        <div className="routes-route-head">
          <h2>Route 1</h2>
          <div>
            <button type="button" className="routes-pill-btn">Save</button>
            <button type="button" className="routes-pill-btn dark" onClick={() => navigate('/routes/start')}>Start</button>
          </div>
        </div>

        <p className="routes-path-text">Takengon Command Shelter - Bintang Relief Post - Laut Tawar Hall</p>

        <div className="routes-metrics-grid">
          <div><strong>3</strong><span>Shelters to Assist</span></div>
          <div><strong>180</strong><span>People Supported</span></div>
          <div><strong>12.4 km</strong><span>Distance</span></div>
          <div><strong>28 min</strong><span>Estimated Time</span></div>
        </div>
      </article>
    </section>
  )
}

function StartRouteCard() {
  return (
    <section className="routes-bottom-sheet">
      <article className="routes-route-card">
        <div className="routes-start-head">
          <span>0 / 3 shelters completed</span>
          <button type="button" className="routes-primary-btn">Mark as Delivered</button>
        </div>

        <p className="routes-path-text">Route 1</p>
        <p className="routes-path-text muted">Takengon Command Shelter - Bintang Relief Post - Laut Tawar Hall</p>

        <h3>Next Stop</h3>
        <p className="routes-next-stop">• Takengon Command Shelter</p>

        <div className="routes-needs-list">
          <p><span>Food Packs</span><span>20 packs</span></p>
          <p><span>Clean Water</span><span>20 liters</span></p>
        </div>

        <div className="routes-metrics-grid">
          <div><strong>2.3 km</strong><span>Distance</span></div>
          <div><strong>6 min</strong><span>Estimated Time</span></div>
        </div>
      </article>
    </section>
  )
}

function RoutesPage() {
  return (
    <main className="routes-page">
      <Routes>
        <Route
          index
          element={
            <>
              <RouteMapBackdrop />
              <RoutesLandingCard />
            </>
          }
        />
        <Route
          path="find"
          element={
            <>
              <RouteMapBackdrop />
              <FindBestRouteCard />
            </>
          }
        />
        <Route
          path="best"
          element={
            <>
              <RouteMapBackdrop withPath />
              <BestRouteCard />
            </>
          }
        />
        <Route
          path="start"
          element={
            <>
              <RouteMapBackdrop withPath withActivePin />
              <StartRouteCard />
            </>
          }
        />
        <Route path="saved" element={<Navigate to="/routes/start" replace />} />
        <Route path="*" element={<Navigate to="/routes" replace />} />
      </Routes>
    </main>
  )
}

export default RoutesPage