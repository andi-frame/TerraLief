import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import './RoutesPage.css'

type SupplyRow = {
  item: string
  quantity: string
  unit: string
}

function RouteMapBackdrop({ withPath = false, withActivePin = false }: { withPath?: boolean; withActivePin?: boolean }) {
  return (
    <div className="routes-map-backdrop" aria-hidden="true">
      <div className="routes-map-grid" />
      {withPath && (
        <svg className="routes-path" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline points="12,42 20,46 26,54 44,47 61,39 71,45 79,55 69,58 61,49 53,54" />
        </svg>
      )}
      {withPath && <span className="routes-pin one" />}
      {withPath && <span className="routes-pin two" />}
      {withPath && <span className="routes-pin three" />}
      {withActivePin && <span className="routes-current-dot" />}
    </div>
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

        <p className="routes-path-text">Hilltop Shelter - Riverside Shelter - Community Hall Shelter</p>

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
        <p className="routes-path-text muted">Hilltop Shelter - Riverside Shelter - Community Hall Shelter</p>

        <h3>Next Stop</h3>
        <p className="routes-next-stop">• Hilltop Shelter</p>

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