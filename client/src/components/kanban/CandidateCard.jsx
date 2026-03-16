import { Draggable } from '@hello-pangea/dnd'
import { useNavigate } from 'react-router-dom'

const AI_STATUS_LABELS = {
  pending: 'Đang xử lý',
  processing: 'Đang xử lý',
  done: 'Hoàn thành',
  manual_review: 'Cần xem xét',
  ai_failed: 'Lỗi AI'
}

const AI_STATUS_COLORS = {
  pending: '#94a3b8',
  processing: '#3b82f6',
  done: '#22c55e',
  manual_review: '#eab308',
  ai_failed: '#ef4444'
}

const getScoreColor = (score) => {
  if (score === undefined || score === null) return '#94a3b8'
  if (score >= 70) return '#22c55e'
  if (score >= 40) return '#eab308'
  return '#ef4444'
}

export const CandidateCard = ({ application, index }) => {
  const navigate = useNavigate()
  const score = application.aiEvaluation?.matchingScore
  const aiStatus = application.aiStatus || 'pending'
  const candidateName =
    application.candidateId?.fullName || application.formData?.fullName || 'Ứng viên'
  const source = application.formData?.source

  return (
    <Draggable draggableId={String(application._id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => navigate(`/hr/applications/${application._id}/review`)}
          style={{
            background: snapshot.isDragging ? '#f0f9ff' : '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '10px 12px',
            marginBottom: 8,
            cursor: 'pointer',
            boxShadow: snapshot.isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.06)',
            transition: 'box-shadow 0.2s',
            ...provided.draggableProps.style
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{candidateName}</span>
            {score !== undefined && score !== null && (
              <span
                style={{
                  background: getScoreColor(score),
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: 99,
                  padding: '2px 8px',
                  minWidth: 32,
                  textAlign: 'center'
                }}
              >
                {score}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            {source && (
              <span
                style={{
                  fontSize: 10,
                  background: '#e0f2fe',
                  color: '#0369a1',
                  borderRadius: 99,
                  padding: '1px 7px'
                }}
              >
                {source}
              </span>
            )}
            <span
              style={{
                fontSize: 10,
                background: `${AI_STATUS_COLORS[aiStatus]}22`,
                color: AI_STATUS_COLORS[aiStatus],
                borderRadius: 99,
                padding: '1px 7px',
                fontWeight: 600
              }}
            >
              {AI_STATUS_LABELS[aiStatus] || aiStatus}
            </span>
          </div>
        </div>
      )}
    </Draggable>
  )
}
