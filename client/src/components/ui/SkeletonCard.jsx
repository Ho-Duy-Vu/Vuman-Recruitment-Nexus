import { SkeletonText } from './SkeletonText'

export function SkeletonCard({ rows = 3 }) {
  return (
    <div className="ui-skeleton ui-skeleton--shimmer ui-skeleton-card">
      <SkeletonText width="55%" height={16} style={{ marginBottom: 10 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonText key={i} width={`${90 - i * 8}%`} height={12} style={{ marginBottom: 8 }} />
      ))}
    </div>
  )
}

