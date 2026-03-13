import './ShelterDetailsSheet.css'

interface SheetRow {
  label: string
  value: string | number
}

interface ShelterDetails {
  occupancy: SheetRow[]
  ageDistribution: SheetRow[]
  healthConditions: SheetRow[]
  currentNeeds: SheetRow[]
}

interface ShelterSheetData {
  id: number
  name: string
  location: string
  count: number
  urgency: 'high' | 'medium' | 'low'
  details: ShelterDetails
}

interface ShelterDetailsSheetProps {
  shelter: ShelterSheetData | null
  onClose: () => void
  onDirections?: (shelter: ShelterSheetData) => void
  onEdit?: (shelter: ShelterSheetData) => void
}

function ShelterDetailsSheet({ shelter, onClose, onDirections, onEdit }: ShelterDetailsSheetProps) {
  if (!shelter) {
    return null
  }

  return (
    <div className="shelter-sheet-backdrop" onClick={onClose} role="presentation">
      <section
        className="shelter-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Shelter details"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="shelter-sheet-handle" type="button" onClick={onClose} aria-label="Close details" />

        <div className="shelter-sheet-actions">
          <button
            type="button"
            className="primary"
            onClick={() => onDirections?.(shelter)}
          >
            Directions
          </button>
          <button type="button" onClick={() => onEdit?.(shelter)}>Edit Shelter</button>
        </div>

        <h2>{shelter.name}</h2>

        <div className="shelter-sheet-meta">
          <span>◎ {shelter.location}</span>
          <span>⚇ {shelter.count}</span>
          <span className={`urgency ${shelter.urgency}`}>● {shelter.urgency[0].toUpperCase() + shelter.urgency.slice(1)} Urgency</span>
        </div>

        <article className="shelter-sheet-card">
          <h3>Current Occupancy</h3>
          {shelter.details.occupancy.map((item) => (
            <p key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </p>
          ))}
        </article>

        <article className="shelter-sheet-card">
          <h3>Age Distribution</h3>
          {shelter.details.ageDistribution.map((item) => (
            <p key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </p>
          ))}
        </article>

        <article className="shelter-sheet-card">
          <div className="shelter-sheet-card-head">
            <h3>Health Conditions</h3>
            <small>People Requiring Special Attention</small>
          </div>
          {shelter.details.healthConditions.map((item) => (
            <p key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </p>
          ))}
        </article>

        <article className="shelter-sheet-card">
          <div className="shelter-sheet-card-head">
            <h3>Current Needs</h3>
            <small>Supplies Still Needed</small>
          </div>
          {shelter.details.currentNeeds.map((item) => (
            <p key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </p>
          ))}
        </article>
      </section>
    </div>
  )
}

export default ShelterDetailsSheet