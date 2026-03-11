import { useEffect } from 'react'
import { divIcon, point, type DivIcon } from 'leaflet'
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import './ReliefMap.css'

export type ReliefMarkerKind =
  | 'flood'
  | 'landslide'
  | 'shelter'
  | 'route-stop'
  | 'current-location'

export interface ReliefMarker {
  id: number | string
  position: [number, number]
  title: string
  subtitle?: string
  popup?: string
  urgency?: 'high' | 'medium' | 'low'
  kind: ReliefMarkerKind
  count?: number
  sequence?: number
  isActive?: boolean
  onClick?: () => void
}

interface ReliefMapProps {
  center: [number, number]
  zoom: number
  markers: ReliefMarker[]
  polyline?: [number, number][]
  focusPosition?: [number, number] | null
  focusZoom?: number
  clustered?: boolean
  className?: string
}

function createDisasterIcon(marker: ReliefMarker): DivIcon {
  const iconName = marker.kind === 'flood' ? 'floodmarker' : 'landslidemarker'

  return divIcon({
    html: `
      <div class="relief-marker relief-marker--disaster ${marker.urgency ?? 'medium'}">
        <img src="/${iconName}.png" alt="" />
      </div>
    `,
    className: 'relief-div-icon',
    iconSize: point(46, 46, true),
    iconAnchor: [23, 23],
    popupAnchor: [0, -20],
  })
}

function createShelterIcon(marker: ReliefMarker): DivIcon {
  return divIcon({
    html: `<div class="relief-marker relief-marker--shelter ${marker.urgency ?? 'low'} ${marker.isActive ? 'is-active' : ''}"><span>${marker.count ?? ''}</span></div>`,
    className: 'relief-div-icon',
    iconSize: point(44, 44, true),
    iconAnchor: [22, 22],
    popupAnchor: [0, -18],
  })
}

function createRouteStopIcon(marker: ReliefMarker): DivIcon {
  return divIcon({
    html: `<div class="relief-marker relief-marker--route-stop"><span>${marker.sequence ?? ''}</span></div>`,
    className: 'relief-div-icon',
    iconSize: point(36, 36, true),
    iconAnchor: [18, 18],
    popupAnchor: [0, -14],
  })
}

function createCurrentLocationIcon(): DivIcon {
  return divIcon({
    html: '<div class="relief-marker relief-marker--current-location"></div>',
    className: 'relief-div-icon',
    iconSize: point(24, 24, true),
    iconAnchor: [12, 12],
  })
}

function getMarkerIcon(marker: ReliefMarker): DivIcon {
  switch (marker.kind) {
    case 'flood':
    case 'landslide':
      return createDisasterIcon(marker)
    case 'shelter':
      return createShelterIcon(marker)
    case 'route-stop':
      return createRouteStopIcon(marker)
    case 'current-location':
      return createCurrentLocationIcon()
    default:
      return createDisasterIcon(marker)
  }
}

function createClusterCustomIcon(cluster: { getChildCount(): number }) {
  return divIcon({
    html: `<span class="cluster-icon">${cluster.getChildCount()}</span>`,
    className: 'custom-marker-cluster',
    iconSize: point(38, 38, true),
  })
}

function MapFocusController({ focusPosition, focusZoom }: { focusPosition?: [number, number] | null; focusZoom?: number }) {
  const map = useMap()

  useEffect(() => {
    if (!focusPosition) {
      return
    }

    map.flyTo(focusPosition, focusZoom ?? map.getZoom(), {
      animate: true,
      duration: 0.8,
    })
  }, [focusPosition, focusZoom, map])

  return null
}

function ReliefMap({ center, zoom, markers, polyline, focusPosition, focusZoom, clustered = false, className }: ReliefMapProps) {
  const markerNodes = markers.map((marker) => (
    <Marker
      key={marker.id}
      position={marker.position}
      icon={getMarkerIcon(marker)}
      eventHandlers={marker.onClick ? { click: marker.onClick } : undefined}
    >
      <Popup>
        <div className="relief-popup">
          <strong>{marker.title}</strong>
          {marker.subtitle && <span>{marker.subtitle}</span>}
          {marker.popup && <p>{marker.popup}</p>}
        </div>
      </Popup>
    </Marker>
  ))

  return (
    <div className={`relief-map-shell ${className ?? ''}`.trim()}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom className="relief-map" zoomControl>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapFocusController focusPosition={focusPosition} focusZoom={focusZoom} />

        {polyline && polyline.length > 1 && (
          <Polyline
            positions={polyline}
            pathOptions={{ color: '#0d43d1', weight: 5, opacity: 0.9, lineCap: 'round' }}
          />
        )}

        {clustered ? (
          <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon}>
            {markerNodes}
          </MarkerClusterGroup>
        ) : (
          markerNodes
        )}
      </MapContainer>
    </div>
  )
}

export default ReliefMap