type UrgencyLevel = 'high' | 'medium' | 'low'

interface InfoCardProps {
  title: string
  subtitle: string
  metaLeft: string
  urgency: UrgencyLevel
}

const urgencyLabel: Record<UrgencyLevel, string> = {
  high: 'High Urgency',
  medium: 'Medium Urgency',
  low: 'Low Urgency',
}

function InfoCard({ title, subtitle, metaLeft, urgency }: InfoCardProps) {
  return (
    <article className="info-card">
      <h4>{title}</h4>
      <p>{subtitle}</p>
      <div>
        <span>{metaLeft}</span>
        <span className={`urgency ${urgency}`}>● {urgencyLabel[urgency]}</span>
      </div>
    </article>
  )
}

export default InfoCard