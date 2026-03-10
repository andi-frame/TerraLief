interface MapReport {
  id: number
  lat: number
  lng: number
  type: string
  urgency: 'high' | 'medium' | 'low'
}

interface MapPlaceholderProps {
  reports: MapReport[]
}

function MapPlaceholder({ reports }: MapPlaceholderProps) {
  return (
    <div className="map-placeholder">
      <div className="placeholder-text">Interactive Map UI</div>

      {reports.map((report) => (
        <div
          key={report.id}
          className={`custom-marker ${report.urgency}`}
          style={{ top: `${report.lat}%`, left: `${report.lng}%` }}
        >
          <img src={`/${report.type}marker.png`} alt={`${report.type} marker`} />
        </div>
      ))}
    </div>
  )
}

export default MapPlaceholder