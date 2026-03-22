export function SkeletonText({
  width = '100%',
  height = 12,
  style = {}
}) {
  return (
    <div
      className="ui-skeleton ui-skeleton--shimmer ui-skeleton-text"
      style={{ width, height, ...style }}
    />
  )
}

