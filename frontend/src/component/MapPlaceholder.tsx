import ReliefMap from './ReliefMap'
import './MapPlaceholder.css'

interface MapReport {
  id: number
  lat: number
  lng: number
  type: 'flood' | 'landslide'
  urgency: 'high' | 'medium' | 'low'
  area: string
}

interface MapPlaceholderProps {
  reports: MapReport[]
  center: [number, number]
}

function MapPlaceholder({ reports, center }: MapPlaceholderProps) {
  return (
    <ReliefMap
      center={center}
      zoom={8}
      clustered
      className="map-placeholder-shell"
      markers={reports.map((report) => ({
        id: report.id,
        position: [report.lat, report.lng],
        kind: report.type,
        title: `${report.type[0].toUpperCase() + report.type.slice(1)} report`,
        subtitle: report.area,
        popup: `${report.urgency[0].toUpperCase() + report.urgency.slice(1)} urgency`,
        urgency: report.urgency,
      }))}
    />
  )
}

export default MapPlaceholder