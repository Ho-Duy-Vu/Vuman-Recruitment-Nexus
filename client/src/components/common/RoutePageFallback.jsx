import { LoadingSpinner } from '../ui/LoadingSpinner'

export function RoutePageFallback() {
  return (
    <div
      className="route-page-fallback ui-page-enter"
      style={{
        display: 'flex',
        minHeight: '45vh',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: 24
      }}
    >
      <LoadingSpinner size={24} label="Đang tải trang" />
      <span style={{ color: 'var(--text-muted)', fontSize: 15 }}>Đang tải trang...</span>
    </div>
  )
}
