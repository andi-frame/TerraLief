import './UrgencyLegend.css'

interface LegendItem {
  id: string
  color: 'red' | 'yellow' | 'green'
  label: string
  subtext: string
}

interface UrgencyLegendProps {
  items: LegendItem[]
}

function UrgencyLegend({ items }: UrgencyLegendProps) {
  return (
    <div className="legend-card">
      {items.map((item) => (
        <p key={item.id}>
          <span className="left-group">
            <span className={`dot ${item.color}`} />
            {item.label}
          </span>
          <em>{item.subtext}</em>
        </p>
      ))}
    </div>
  )
}

export default UrgencyLegend