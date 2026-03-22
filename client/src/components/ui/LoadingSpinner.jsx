export function LoadingSpinner({ size = 16, label = 'Đang tải...' }) {
  return (
    <span
      className="ui-spinner"
      role="status"
      aria-label={label}
      style={{
        width: size,
        height: size
      }}
    />
  )
}

