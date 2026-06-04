interface StatCardProps {
  label: string
  value: string
  helper?: string
  tone?: 'default' | 'success' | 'warning' | 'danger'
}

export function StatCard({
  label,
  value,
  helper,
  tone = 'default',
}: StatCardProps) {
  return (
    <article className="stat-card" data-tone={tone}>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      {helper ? <span className="stat-helper">{helper}</span> : null}
    </article>
  )
}
