const STAGE_COLORS = {
  'Mới': '#6366f1',
  'Đang xét duyệt': '#f59e0b',
  'Phỏng vấn': '#3b82f6',
  'Đề xuất': '#8b5cf6',
  'Đã tuyển': '#22c55e',
  'Không phù hợp': '#ef4444'
}

/**
 * Chỉ hiển thị giai đoạn hiện tại (một badge), không vẽ cả pipeline.
 */
export function StageTimeline({ currentStage }) {
  const label = currentStage || 'Mới'
  const bg = STAGE_COLORS[label] || '#64748b'

  if (label === 'Không phù hợp') {
    return (
      <span
        style={{
          display: 'inline-block',
          fontWeight: 700,
          fontSize: 12,
          padding: '4px 10px',
          borderRadius: 99,
          background: '#fee2e2',
          color: '#b91c1c'
        }}
      >
        Không phù hợp
      </span>
    )
  }

  return (
    <span
      style={{
        display: 'inline-block',
        fontWeight: 700,
        fontSize: 12,
        padding: '4px 10px',
        borderRadius: 99,
        background: bg,
        color: '#fff'
      }}
    >
      {label}
    </span>
  )
}
