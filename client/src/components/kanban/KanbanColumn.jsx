import { Droppable } from '@hello-pangea/dnd'
import { CandidateCard } from './CandidateCard'

const COLUMN_COLORS = {
  'Mới': '#6366f1',
  'Đang xét duyệt': '#f59e0b',
  'Phỏng vấn': '#3b82f6',
  'Đề xuất': '#8b5cf6',
  'Đã tuyển': '#22c55e',
  'Không phù hợp': '#ef4444'
}

export const KanbanColumn = ({ stage, applications }) => {
  const color = COLUMN_COLORS[stage] || '#94a3b8'

  return (
    <div style={{
      width: 240,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-white)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-card)',
      overflow: 'hidden'
    }}>
      {/* Column header */}
      <div style={{
        padding: '10px 14px',
        borderBottom: `3px solid ${color}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fafafa'
      }}>
        <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{stage}</span>
        <span style={{
          background: color,
          color: '#fff',
          borderRadius: 99,
          padding: '1px 8px',
          fontSize: 12,
          fontWeight: 700
        }}>
          {applications.length}
        </span>
      </div>

      {/* Drop zone */}
      <Droppable droppableId={stage}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              padding: 10,
              minHeight: 200,
              flex: 1,
              background: snapshot.isDraggingOver ? `${color}18` : 'transparent',
              transition: 'background 0.2s'
            }}
          >
            {applications.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: 12,
                marginTop: 24,
                fontStyle: 'italic'
              }}>
                Chưa có ứng viên
              </div>
            ) : (
              applications.map((app, idx) => (
                <CandidateCard key={String(app._id)} application={app} index={idx} />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}
