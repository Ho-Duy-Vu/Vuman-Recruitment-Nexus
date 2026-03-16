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
      const scoreA = a.aiEvaluation?.matchingScore ?? -1
      const scoreB = b.aiEvaluation?.matchingScore ?? -1
      return scoreB - scoreA
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
        const [moved] = srcList.splice(source.index, 1)
        const movedWithNewStage = { ...moved, stage: dstStage }
        dstList.splice(destination.index, 0, movedWithNewStage)
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
              srcList.splice(source.index, 0, { ...card, stage: srcStage })
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
            srcList.splice(source.index, 0, { ...card, stage: srcStage })
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
    } catch {
      // error handled in caller
    }
  }, [])

  return { columns, loading, error, handleDragEnd, confirmSchedule, reload: load }
}
