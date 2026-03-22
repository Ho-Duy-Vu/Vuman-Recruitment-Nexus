import { useState, useEffect, useCallback } from 'react'
import { fetchApplicationsByJob, changeApplicationStage } from '../api/application.api'

export const STAGES = ['Mới', 'Đang xét duyệt', 'Phỏng vấn', 'Đề xuất', 'Đã tuyển']
export const REJECTED_STAGE = 'Không phù hợp'

const groupByStage = (applications) => {
  const groups = {}
  ;[...STAGES, REJECTED_STAGE].forEach((s) => {
    groups[s] = []
  })
  applications.forEach((app) => {
    const stage = app.stage || 'Mới'
    if (groups[stage] !== undefined) {
      groups[stage].push(app)
    } else {
      groups['Mới'].push(app)
    }
  })
  Object.keys(groups).forEach((stage) => {
    groups[stage].sort((a, b) => {
      const tA = new Date(a.appliedAt || a.createdAt || 0).getTime()
      const tB = new Date(b.appliedAt || b.createdAt || 0).getTime()
      if (tB !== tA) return tB - tA
      const nameA = (a.formData?.fullName || a.candidateId?.fullName || '').toLowerCase()
      const nameB = (b.formData?.fullName || b.candidateId?.fullName || '').toLowerCase()
      return nameA.localeCompare(nameB, 'vi')
    })
  })
  return groups
}

export const useKanban = (jobId) => {
  const [columns, setColumns] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!jobId) return
    setLoading(true)
    setError(null)
    try {
      const apps = await fetchApplicationsByJob(jobId)
      setColumns(groupByStage(apps))
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách ứng viên')
    } finally {
      setLoading(false)
    }
  }, [jobId])

  useEffect(() => {
    load()
  }, [load])

  const handleDragEnd = useCallback(
    async (result, openScheduleModal) => {
      const { destination, source, draggableId } = result
      if (!destination) return
      if (destination.droppableId === source.droppableId && destination.index === source.index) return

      const srcStage = source.droppableId
      const dstStage = destination.droppableId

      // Optimistic update
      setColumns((prev) => {
        const next = { ...prev }
        const srcList = [...(next[srcStage] || [])]
        const dstList = srcStage === dstStage ? srcList : [...(next[dstStage] || [])]
        // Remove by id to avoid index mismatch when UI renders a truncated list.
        const movedIdx = srcList.findIndex((a) => String(a._id) === String(draggableId))
        if (movedIdx === -1) return prev
        const [moved] = srcList.splice(movedIdx, 1)
        const movedWithNewStage = { ...moved, stage: dstStage }
        // Keep UI stable: append rather than inserting by destination.index.
        // This prevents wrong positioning when we only render a subset.
        dstList.push(movedWithNewStage)
        next[srcStage] = srcList
        if (srcStage !== dstStage) next[dstStage] = dstList
        return next
      })

      if (dstStage === 'Phỏng vấn') {
        // Defer API call — let ScheduleModal confirm trigger it
        const revert = () => {
          setColumns((prev) => {
            const next = { ...prev }
            const dstList = [...(next[dstStage] || [])]
            const idx = dstList.findIndex((a) => String(a._id) === draggableId)
            if (idx !== -1) {
              const [card] = dstList.splice(idx, 1)
              const srcList = [...(next[srcStage] || [])]
              // Re-add at end to avoid index mismatch when truncated view.
              srcList.push({ ...card, stage: srcStage })
              next[dstStage] = dstList
              next[srcStage] = srcList
            }
            return next
          })
        }
        openScheduleModal({ appId: draggableId, revert, srcStage, dstStage, destIndex: destination.index })
        return
      }

      try {
        await changeApplicationStage(draggableId, dstStage)
      } catch {
        // Revert optimistic update on failure
        setColumns((prev) => {
          const next = { ...prev }
          const dstList = [...(next[dstStage] || [])]
          const idx = dstList.findIndex((a) => String(a._id) === draggableId)
          if (idx !== -1) {
            const [card] = dstList.splice(idx, 1)
            const srcList = [...(next[srcStage] || [])]
            // Re-add at end to keep stable when UI is truncated.
            srcList.push({ ...card, stage: srcStage })
            next[dstStage] = dstList
            next[srcStage] = srcList
          }
          return next
        })
      }
    },
    []
  )

  const confirmSchedule = useCallback(async (appId, srcStage, scheduleData) => {
    try {
      await changeApplicationStage(appId, 'Phỏng vấn', scheduleData)
      await load()
    } catch {
      // error handled in caller
    }
  }, [load])

  return { columns, loading, error, handleDragEnd, confirmSchedule, reload: load }
}
