import { SkeletonCard } from './SkeletonCard'

export function SkeletonTable({ rowCount = 6 }) {
  return (
    <div className="ui-skeleton-table">
      {Array.from({ length: rowCount }).map((_, i) => (
        <div key={i} className="ui-skeleton-table-row">
          <SkeletonCard rows={1} />
        </div>
      ))}
    </div>
  )
}

