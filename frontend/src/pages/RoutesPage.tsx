import { useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import ReliefMap, { type ReliefMarker } from '../component/ReliefMap'
import {
  ACEH_CENTER,
  MAP_REPORTS,
  ROUTE_OPTIONS,
  SHELTER_MAP_ITEMS,
} from './mockData'
import './RoutesPage.css'

type SupplyRow = {
  id: string
  item: string
  quantity: string
  unit: string
}

type RouteFormData = {
  supplies: SupplyRow[]
  vehicleType: 'motorcycle' | 'car' | 'truck'
  shelterCount: 'Auto' | '1' | '2' | '3'
  startMode: 'current' | 'warehouse' | 'custom'
  customStart: string
  uploadedFileName: string
}

type RouteSummary = {
  sheltersToAssist: number
  peopleSupported: number
  distanceLabel: string
  etaLabel: string
}

type SavedRouteState = {
  formData: RouteFormData
  routeId: string
}

const SAVED_ROUTE_KEY = 'terralief-saved-route'

function createSupplyRow(seed: number): SupplyRow {
  return {
    id: `supply-${seed}`,
    item: '',
    quantity: '',
    unit: '',
  }
}

const DEFAULT_ROUTE_FORM: RouteFormData = {
  supplies: [createSupplyRow(1)],
  vehicleType: 'motorcycle',
  shelterCount: 'Auto',
  startMode: 'current',
  customStart: '',
  uploadedFileName: '',
}

function getRouteSummary(formData: RouteFormData, routeId?: string): RouteSummary {
  const selectedRoute = ROUTE_OPTIONS.find((route) => route.id === routeId) ?? ROUTE_OPTIONS[0]
  const sheltersToAssist = formData.shelterCount === 'Auto'
    ? selectedRoute.sheltersToAssist
    : Number(formData.shelterCount)
  const quantityTotal = formData.supplies.reduce(
    (total, row) => total + (Number(row.quantity) || 0),
    0,
  )
  const peopleSupported = Math.max(selectedRoute.peopleSupported, sheltersToAssist * 50 + quantityTotal)
  const baseDistance = selectedRoute.distanceKm + (sheltersToAssist - selectedRoute.sheltersToAssist) * 0.8
  const vehiclePenalty = formData.vehicleType === 'truck' ? 6 : formData.vehicleType === 'car' ? 4 : 0
  const etaMinutes = selectedRoute.etaMin + vehiclePenalty

  return {
    sheltersToAssist,
    peopleSupported,
    distanceLabel: `${baseDistance.toFixed(1)} km`,
    etaLabel: `${etaMinutes} min`,
  }
}

function loadSavedRoute(): SavedRouteState | null {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue = window.localStorage.getItem(SAVED_ROUTE_KEY)
  if (!rawValue) {
    return null
  }

  try {
    return JSON.parse(rawValue) as SavedRouteState
  } catch {
    return null
  }
}

function getActiveRoute(routeId?: string) {
  return ROUTE_OPTIONS.find((route) => route.id === routeId) ?? ROUTE_OPTIONS[0]
}

function RouteMapBackdrop({ withPath = false, withActivePin = false }: { withPath?: boolean; withActivePin?: boolean }) {
  const location = useLocation()
  const locationState = (location.state ?? {}) as { routeId?: string }
  const savedRouteState = loadSavedRoute()
  const activeRoute = getActiveRoute(locationState.routeId ?? savedRouteState?.routeId)

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
      ? activeRoute.stops.map((stop, index) => ({
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
            position: activeRoute.path[0],
            kind: 'current-location' as const,
            title: 'Your current location',
            popup: 'Live volunteer location',
          },
        ]
      : []

    return [...disasterMarkers, ...shelterMarkers, ...routeMarkers, ...currentLocationMarker]
  }, [activeRoute.path, activeRoute.stops, withActivePin, withPath])

  return (
    <ReliefMap
      center={ACEH_CENTER}
      zoom={8}
      clustered={!withPath}
      className="routes-map-layer"
      markers={markers}
      polyline={withPath ? activeRoute.path : undefined}
      focusPosition={withPath ? activeRoute.path[0] : null}
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
      <button type="button" className="routes-secondary-btn" onClick={() => navigate('/report-road')}>
        Report Road Condition
      </button>
      <button type="button" className="routes-link-btn" onClick={() => navigate('/routes/start')}>
        View Saved Routes
      </button>
    </section>
  )
}

function FindBestRouteCard() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<RouteFormData>(DEFAULT_ROUTE_FORM)

  const updateSupply = (id: string, field: keyof Omit<SupplyRow, 'id'>, value: string) => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      supplies: currentFormData.supplies.map((row) =>
        row.id === id ? { ...row, [field]: value } : row,
      ),
    }))
  }

  const addSupplyRow = () => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      supplies: [...currentFormData.supplies, createSupplyRow(currentFormData.supplies.length + 1)],
    }))
  }

  const removeSupplyRow = (id: string) => {
    setFormData((currentFormData) => ({
      ...currentFormData,
      supplies:
        currentFormData.supplies.length === 1
          ? currentFormData.supplies
          : currentFormData.supplies.filter((row) => row.id !== id),
    }))
  }

  return (
    <section className="routes-overlay-card routes-find-card">
      <h2>Find Best Aid Route</h2>

      <h3>Supplies You Carry</h3>
      <p className="routes-help-text">
        You can manually add items or upload a photo of your supply list for automatic
        detection.
      </p>

      <label className="routes-upload-box">
        <p>Upload an image or file of your supply list for automatic item detection.</p>
        <span>Browse File</span>
        <input
          type="file"
          accept="image/*,.pdf,.csv"
          onChange={(event) =>
            setFormData((currentFormData) => ({
              ...currentFormData,
              uploadedFileName: event.target.files?.[0]?.name ?? '',
            }))
          }
        />
      </label>
      {formData.uploadedFileName && <p className="routes-file-name">{formData.uploadedFileName}</p>}

      <div className="routes-input-head">
        <span>Supply Item</span>
        <span>Quantity</span>
        <span>Unit</span>
      </div>

      <div className="routes-supply-list">
        {formData.supplies.map((row) => (
          <div key={row.id} className="routes-supply-row">
            <div className="routes-input-row">
              <input
                value={row.item}
                placeholder="e.g., Clean Water"
                onChange={(event) => updateSupply(row.id, 'item', event.target.value)}
              />
              <input
                value={row.quantity}
                placeholder="e.g., 50"
                onChange={(event) => updateSupply(row.id, 'quantity', event.target.value)}
              />
              <input
                value={row.unit}
                placeholder="e.g., liters"
                onChange={(event) => updateSupply(row.id, 'unit', event.target.value)}
              />
            </div>
            <button
              type="button"
              className="routes-remove-btn"
              onClick={() => removeSupplyRow(row.id)}
              disabled={formData.supplies.length === 1}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="routes-add-btn" onClick={addSupplyRow}>
        + Add Supply
      </button>

      <h3>Vehicle Type</h3>
      <label>
        <input
          type="radio"
          name="vehicle"
          checked={formData.vehicleType === 'motorcycle'}
          onChange={() => setFormData((currentFormData) => ({ ...currentFormData, vehicleType: 'motorcycle' }))}
        />
        Motorcycle
      </label>
      <label>
        <input
          type="radio"
          name="vehicle"
          checked={formData.vehicleType === 'car'}
          onChange={() => setFormData((currentFormData) => ({ ...currentFormData, vehicleType: 'car' }))}
        />
        Car
      </label>
      <label>
        <input
          type="radio"
          name="vehicle"
          checked={formData.vehicleType === 'truck'}
          onChange={() => setFormData((currentFormData) => ({ ...currentFormData, vehicleType: 'truck' }))}
        />
        Truck
      </label>

      <h3>Number of Shelters to Visit</h3>
      <select
        value={formData.shelterCount}
        onChange={(event) =>
          setFormData((currentFormData) => ({
            ...currentFormData,
            shelterCount: event.target.value as RouteFormData['shelterCount'],
          }))
        }
      >
        <option>Auto</option>
        <option>1</option>
        <option>2</option>
        <option>3</option>
      </select>

      <h3>Starting Point</h3>
      <label>
        <input
          type="radio"
          name="starting"
          checked={formData.startMode === 'current'}
          onChange={() => setFormData((currentFormData) => ({ ...currentFormData, startMode: 'current' }))}
        />
        Current Location
      </label>
      <label>
        <input
          type="radio"
          name="starting"
          checked={formData.startMode === 'warehouse'}
          onChange={() => setFormData((currentFormData) => ({ ...currentFormData, startMode: 'warehouse' }))}
        />
        Logistics Warehouse
      </label>
      <label>
        <input
          type="radio"
          name="starting"
          checked={formData.startMode === 'custom'}
          onChange={() => setFormData((currentFormData) => ({ ...currentFormData, startMode: 'custom' }))}
        />
        Custom Start Point
      </label>

      {formData.startMode === 'custom' && (
        <input
          className="routes-custom-input"
          value={formData.customStart}
          placeholder="Type address or logistics hub"
          onChange={(event) =>
            setFormData((currentFormData) => ({ ...currentFormData, customStart: event.target.value }))
          }
        />
      )}

      <div className="routes-actions">
        <button type="button" className="routes-secondary-btn" onClick={() => navigate('/routes')}>
          Cancel
        </button>
        <button
          type="button"
          className="routes-primary-btn"
          onClick={() => navigate('/routes/best', { state: { formData } })}
        >
          Find Route
        </button>
      </div>
    </section>
  )
}

function BestRouteCard() {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = (location.state ?? {}) as { formData?: RouteFormData; routeId?: string }
  const savedRoute = loadSavedRoute()
  const formData = locationState.formData ?? savedRoute?.formData ?? DEFAULT_ROUTE_FORM
  const [selectedRouteId, setSelectedRouteId] = useState(
    locationState.routeId ?? savedRoute?.routeId ?? ROUTE_OPTIONS[0].id,
  )
  const activeRoute = getActiveRoute(selectedRouteId)
  const summary = getRouteSummary(formData, selectedRouteId)
  const supplyPreview = formData.supplies.filter((row) => row.item.trim())

  return (
    <section className="routes-bottom-sheet">
      <div className="routes-chip">{ROUTE_OPTIONS.length} Recommended Routes</div>

      <article className="routes-route-card">
        <div className="routes-route-options" role="tablist" aria-label="Route options">
          {ROUTE_OPTIONS.map((route) => (
            <button
              key={route.id}
              type="button"
              className={`routes-route-option ${selectedRouteId === route.id ? 'active' : ''}`}
              onClick={() => setSelectedRouteId(route.id)}
            >
              {route.name}
            </button>
          ))}
        </div>

        <div className="routes-route-head">
          <h2>{activeRoute.name}</h2>
          <div>
            <button
              type="button"
              className="routes-pill-btn"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.localStorage.setItem(
                    SAVED_ROUTE_KEY,
                    JSON.stringify({ formData, routeId: selectedRouteId }),
                  )
                }
              }}
            >
              Save
            </button>
            <button
              type="button"
              className="routes-pill-btn dark"
              onClick={() => navigate('/routes/start', { state: { formData, routeId: selectedRouteId } })}
            >
              Start
            </button>
          </div>
        </div>

        <p className="routes-path-text">
          {activeRoute.stops.map((stop) => stop.name).join(' - ')}
        </p>

        <div className="routes-metrics-grid">
          <div><strong>{summary.sheltersToAssist}</strong><span>Shelters to Assist</span></div>
          <div><strong>{summary.peopleSupported}</strong><span>People Supported</span></div>
          <div><strong>{summary.distanceLabel}</strong><span>Distance</span></div>
          <div><strong>{summary.etaLabel}</strong><span>Estimated Time</span></div>
        </div>

        {supplyPreview.length > 0 && (
          <div className="routes-preview-list">
            {supplyPreview.slice(0, 3).map((row) => (
              <p key={row.id}>
                <span>{row.item}</span>
                <span>{row.quantity} {row.unit}</span>
              </p>
            ))}
          </div>
        )}
      </article>
    </section>
  )
}

function StartRouteCard() {
  const location = useLocation()
  const locationState = (location.state ?? {}) as { formData?: RouteFormData; routeId?: string }
  const savedRoute = loadSavedRoute()
  const formData = locationState.formData ?? savedRoute?.formData ?? DEFAULT_ROUTE_FORM
  const activeRoute = getActiveRoute(locationState.routeId ?? savedRoute?.routeId)
  const summary = getRouteSummary(formData, activeRoute.id)
  const [completedStops, setCompletedStops] = useState(0)
  const activeSupplies = formData.supplies.filter((row) => row.item.trim())
  const nextStop = activeRoute.stops[Math.min(completedStops, activeRoute.stops.length - 1)]

  return (
    <section className="routes-bottom-sheet">
      <article className="routes-route-card">
        <div className="routes-start-head">
          <span>{completedStops} / {summary.sheltersToAssist} shelters completed</span>
          <button
            type="button"
            className="routes-primary-btn"
            onClick={() => setCompletedStops((value) => Math.min(value + 1, summary.sheltersToAssist))}
          >
            Mark as Delivered
          </button>
        </div>

        <p className="routes-path-text">{activeRoute.name}</p>
        <p className="routes-path-text muted">{activeRoute.stops.map((stop) => stop.name).join(' - ')}</p>

        <h3>Next Stop</h3>
        <p className="routes-next-stop">• {nextStop.name}</p>

        <div className="routes-needs-list">
          {activeSupplies.length > 0 ? (
            activeSupplies.slice(0, 3).map((row) => (
              <p key={row.id}><span>{row.item}</span><span>{row.quantity} {row.unit}</span></p>
            ))
          ) : (
            <p><span>No supplies added yet</span><span>—</span></p>
          )}
        </div>

        <div className="routes-metrics-grid">
          <div><strong>{summary.distanceLabel}</strong><span>Distance</span></div>
          <div><strong>{summary.etaLabel}</strong><span>Estimated Time</span></div>
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