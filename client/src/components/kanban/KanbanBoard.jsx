import { useState } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import { KanbanColumn } from './KanbanColumn'
import { ScheduleModal } from '../application/ScheduleModal'
import { useKanban, STAGES, REJECTED_STAGE } from '../../hooks/useKanban'

export const KanbanBoard = ({ jobId }) => {
  const { columns, loading, error, handleDragEnd, confirmSchedule } = useKanban(jobId)
  const [showRejected, setShowRejected] = useState(false)
  const [scheduleCtx, setScheduleCtx] = useState(null)

  const openScheduleModal = (ctx) => setScheduleCtx(ctx)
  const closeScheduleModal = () => {
    if (scheduleCtx?.revert) scheduleCtx.revert()
    setScheduleCtx(null)
  }

  const handleScheduleConfirm = async (scheduleData) => {
    if (!scheduleCtx) return
    await confirmSchedule(scheduleCtx.appId, scheduleCtx.srcStage, scheduleData)
    setScheduleCtx(null)
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
        Đang tải dữ liệu...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#ef4444' }}>{error}</div>
    )
  }

  const visibleStages = showRejected ? [...STAGES, REJECTED_STAGE] : STAGES

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button
          onClick={() => setShowRejected((v) => !v)}
          style={{
            fontSize: 13,
            padding: '6px 14px',
            borderRadius: 6,
            border: '1px solid #d1d5db',
            background: showRejected ? '#fee2e2' : '#f8fafc',
            color: showRejected ? '#ef4444' : '#64748b',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          {showRejected ? 'Ẩn "Không phù hợp"' : 'Hiện "Không phù hợp"'}
        </button>
      </div>

      <DragDropContext onDragEnd={(result) => handleDragEnd(result, openScheduleModal)}>
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 12, alignItems: 'flex-start' }}>
          {visibleStages.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              applications={columns[stage] || []}
            />
          ))}
        </div>
      </DragDropContext>

      {scheduleCtx && (
        <ScheduleModal
          onConfirm={handleScheduleConfirm}
          onCancel={closeScheduleModal}
        />
      )}
    </div>
  )
}
