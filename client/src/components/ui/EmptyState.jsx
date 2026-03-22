export function EmptyState({
  title,
  description,
  icon = '📭'
}) {
  return (
    <div className="ui-empty-state">
      <div className="ui-empty-state-icon" aria-hidden="true">{icon}</div>
      {title && <div className="ui-empty-state-title">{title}</div>}
      {description && <div className="ui-empty-state-desc">{description}</div>}
    </div>
  )
}

