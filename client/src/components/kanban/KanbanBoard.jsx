import { useCallback, useEffect, useState } from 'react'
import { DragDropContext } from '@hello-pangea/dnd'
import { KanbanColumn } from './KanbanColumn'
import { ScheduleModal } from '../application/ScheduleModal'
import { useKanban, STAGES, REJECTED_STAGE } from '../../hooks/useKanban'
import { useKanbanRealtime } from '../../hooks/useKanbanRealtime'
import { SkeletonCard } from '../ui/SkeletonCard'
import { bulkRejectApplications } from '../../api/application.api'

export const KanbanBoard = ({ jobId, jobExpired = false }) => {
  const { columns, loading, error, handleDragEnd, confirmSchedule, reload } = useKanban(jobId)
  const { viewingByApp, emitViewing } = useKanbanRealtime(jobId, reload)
  const [showRejected, setShowRejected] = useState(false)
  const [scheduleCtx, setScheduleCtx] = useState(null)
  const [stageLimits, setStageLimits] = useState({})
  const [bulkMode, setBulkMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [bulkLoading, setBulkLoading] = useState(false)

  useEffect(() => {
    if (!bulkMode) setSelectedIds(new Set())
  }, [bulkMode])

  useEffect(() => {
    setSelectedIds(new Set())
    setBulkMode(false)
  }, [jobId])

  const toggleSelect = useCallback((applicationId) => {
    const sid = String(applicationId)
    setSelectedIds((prev) => {
      const n = new Set(prev)
      if (n.has(sid)) n.delete(sid)
      else n.add(sid)
      return n
    })
  }, [])

  const handleBulkReject = async () => {
    if (!jobId || selectedIds.size === 0) return
    // eslint-disable-next-line no-alert
    const ok = window.confirm(
      `Từ chối ${selectedIds.size} hồ sơ đã chọn? Hệ thống sẽ chuyển sang "Không phù hợp" và gửi email (nếu cấu hình).`
    )
    if (!ok) return
    setBulkLoading(true)
    try {
      await bulkRejectApplications(jobId, Array.from(selectedIds))
      setSelectedIds(new Set())
      setBulkMode(false)
      await reload()
    } catch (e) {
      // eslint-disable-next-line no-alert
      window.alert(e?.response?.data?.message || 'Không thể từ chối hàng loạt.')
    } finally {
      setBulkLoading(false)
    }
  }

  const DEFAULT_STAGE_LIMIT = 40
  const STAGE_INCREMENT = 20

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
      <div
        className="kanban-board-viewport"
        style={{
          overflow: 'auto',
          maxHeight: 'calc(100vh - 220px)',
          width: '100%',
          paddingBottom: 12
        }}
      >
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', width: 'max-content' }}>
          {[...STAGES, REJECTED_STAGE].map((stage) => (
            <div key={stage} style={{ width: 240, flexShrink: 0 }}>
              <SkeletonCard rows={4} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#ef4444' }}>{error}</div>
    )
  }

  const visibleStages = showRejected ? [...STAGES, REJECTED_STAGE] : STAGES

  const selectedCount = selectedIds.size

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <button
          type="button"
          onClick={() => setBulkMode((v) => !v)}
          style={{
            fontSize: 13,
            padding: '6px 14px',
            borderRadius: 6,
            border: '1px solid #d1d5db',
            background: bulkMode ? '#eef2ff' : 'var(--bg-white)',
            color: bulkMode ? '#4338ca' : 'var(--text-primary)',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          {bulkMode ? 'Thoát chọn nhiều' : 'Chọn nhiều — từ chối'}
        </button>
        <button
          type="button"
          onClick={() => setShowRejected((v) => !v)}
          style={{
            fontSize: 13,
            padding: '6px 14px',
            borderRadius: 6,
            border: '1px solid #d1d5db',
            background: showRejected ? '#fee2e2' : 'var(--bg-white)',
            color: showRejected ? '#b91c1c' : 'var(--text-primary)',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          {showRejected ? 'Ẩn "Không phù hợp"' : 'Hiện "Không phù hợp"'}
        </button>
      </div>

      <DragDropContext onDragEnd={(result) => handleDragEnd(result, openScheduleModal)}>
        {/*
          Một scroll container duy nhất (viewport) — tránh nested scroll với Droppable
          (@hello-pangea/dnd chỉ hỗ trợ một scroll parent).
        */}
        <div
          className="kanban-board-viewport"
          style={{
            overflow: 'auto',
            maxHeight: 'calc(100vh - 220px)',
            width: '100%',
            paddingBottom: 12
          }}
        >
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', width: 'max-content' }}>
          {visibleStages.map((stage) => (
            (() => {
              const allApps = columns[stage] || []
              const limit = stageLimits[stage] ?? DEFAULT_STAGE_LIMIT
              const visibleApps = allApps.slice(0, limit)
              const hasMore = allApps.length > limit
              return (
                <KanbanColumn
                  key={stage}
                  stage={stage}
                  applications={visibleApps}
                  totalCount={allApps.length}
                  hasMore={hasMore}
                  viewingByApp={viewingByApp}
                  onBeforeOpenCard={(applicationId) => emitViewing(applicationId)}
                  onLoadMore={() => {
                    setStageLimits((prev) => ({ ...prev, [stage]: limit + STAGE_INCREMENT }))
                  }}
                  bulkMode={bulkMode}
                  selectedIds={selectedIds}
                  onToggleSelect={toggleSelect}
                  jobExpired={jobExpired}
                />
              )
            })()
          ))}
          </div>
        </div>
      </DragDropContext>

      {scheduleCtx && (
        <ScheduleModal
          onConfirm={handleScheduleConfirm}
          onCancel={closeScheduleModal}
        />
      )}

      {bulkMode && selectedCount > 0 && (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            bottom: 24,
            transform: 'translateX(-50%)',
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 18px',
            borderRadius: 12,
            background: 'var(--bg-white)',
            border: '1px solid var(--border-card)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
            fontSize: 14,
            fontWeight: 600
          }}
        >
          <span>Đã chọn {selectedCount}</span>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setSelectedIds(new Set())}
            disabled={bulkLoading}
          >
            Bỏ chọn
          </button>
          <button
            type="button"
            className="btn btn-primary"
            style={{ background: '#b91c1c', borderColor: '#b91c1c' }}
            onClick={() => void handleBulkReject()}
            disabled={bulkLoading}
          >
            {bulkLoading ? 'Đang xử lý...' : `Từ chối (${selectedCount})`}
          </button>
        </div>
      )}
    </div>
  )
}
