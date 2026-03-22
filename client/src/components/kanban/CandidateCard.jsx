import { Draggable } from '@hello-pangea/dnd'
import { useNavigate } from 'react-router-dom'

export const CandidateCard = ({
  application,
  index,
  viewedBy,
  onBeforeOpen,
  bulkMode = false,
  selected = false,
  onToggleSelect,
  jobExpired = false
}) => {
  const navigate = useNavigate()
  const candidateName =
    application.formData?.fullName || application.candidateId?.fullName || 'Ứng viên'
  const source = application.formData?.source

  const goReview = () => {
    onBeforeOpen?.(application._id)
    navigate(`/hr/applications/${application._id}/review`)
  }

  return (
    <Draggable draggableId={String(application._id)} index={index} isDragDisabled={bulkMode}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          role="button"
          tabIndex={0}
          onClick={() => {
            if (bulkMode) {
              onToggleSelect?.(application._id)
              return
            }
            goReview()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              if (bulkMode) onToggleSelect?.(application._id)
              else goReview()
            }
          }}
          style={{
            background: snapshot.isDragging ? '#f0f9ff' : selected ? '#eef2ff' : 'var(--bg-white)',
            border: `1px solid ${selected ? '#6366f1' : 'var(--border-card)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            marginBottom: 8,
            cursor: bulkMode ? 'pointer' : 'pointer',
            transition: 'background 0.15s',
            ...provided.draggableProps.style
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            {bulkMode ? (
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggleSelect?.(application._id)}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Chọn ${candidateName}`}
                style={{ marginTop: 2, cursor: 'pointer' }}
              />
            ) : (
              <span
                {...provided.dragHandleProps}
                role="button"
                aria-label="Kéo để chuyển trạng thái"
                onClick={(e) => e.stopPropagation()}
                style={{
                  cursor: 'grab',
                  fontSize: 14,
                  lineHeight: '14px',
                  paddingRight: 8,
                  color: snapshot.isDragging ? '#64748b' : 'var(--text-muted)',
                  userSelect: 'none'
                }}
              >
                ⋮⋮
              </span>
            )}
            <span style={{ fontWeight: 600, fontSize: 13, color: snapshot.isDragging ? '#1c1c1c' : 'var(--text-primary)' }}>
              {candidateName}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {jobExpired && (
              <span
                style={{
                  fontSize: 10,
                  background: '#fef3c7',
                  color: '#b45309',
                  borderRadius: 99,
                  padding: '1px 7px',
                  fontWeight: 700
                }}
              >
                JD quá hạn
              </span>
            )}
            {source && (
              <span style={{
                fontSize: 10,
                background: '#e0f2fe',
                color: '#0369a1',
                borderRadius: 99,
                padding: '1px 7px'
              }}>
                {source}
              </span>
            )}
            {viewedBy && (
              <span style={{
                fontSize: 10,
                background: '#fef3c7',
                color: '#b45309',
                borderRadius: 99,
                padding: '1px 7px',
                fontWeight: 600
              }}>
                Đang xem: {viewedBy}
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}
