import { useEffect, useRef, useState, useCallback } from 'react'
import { useSelector } from 'react-redux'

import { selectAccessToken, selectCurrentUser } from '../store/authSlice'
import { createAppSocket } from '../utils/socketClient'

/**
 * Một kết nối Socket.io cho Kanban: reload + badge “đang xem”.
 */
export function useKanbanRealtime(jobId, onReload) {
  const token = useSelector(selectAccessToken)
  const user = useSelector(selectCurrentUser)
  const [viewingByApp, setViewingByApp] = useState({})
  const reloadRef = useRef(onReload)
  reloadRef.current = onReload
  const socketRef = useRef(null)

  const emitViewing = useCallback(
    (applicationId, viewerName) => {
      const s = socketRef.current
      if (!s?.connected || !jobId || !applicationId) return
      s.emit('application:viewing', {
        jobId,
        applicationId,
        viewerName: viewerName || user?.fullName || user?.email || 'HR'
      })
    },
    [jobId, user?.email, user?.fullName]
  )

  const emitLeaveViewing = useCallback(
    (applicationId) => {
      const s = socketRef.current
      if (!s?.connected || !jobId || !applicationId) return
      s.emit('application:leave_viewing', { jobId, applicationId })
    },
    [jobId]
  )

  useEffect(() => {
    if (!jobId || !token) return
    const role = user?.role
    if (role !== 'hr' && role !== 'admin') return

    const socket = createAppSocket({
      auth: { token },
      transports: ['websocket', 'polling']
    })
    socketRef.current = socket

    const reload = () => {
      if (typeof reloadRef.current === 'function') reloadRef.current()
    }

    socket.on('connect', () => {
      socket.emit('application:join_job', { jobId })
    })

    socket.on('application:stage_changed', reload)
    socket.on('application:new', reload)

    socket.on('application:viewing', ({ applicationId, viewerName }) => {
      setViewingByApp((prev) => ({
        ...prev,
        [String(applicationId)]: viewerName || 'HR'
      }))
    })

    socket.on('application:leave_viewing', ({ applicationId }) => {
      setViewingByApp((prev) => {
        const next = { ...prev }
        delete next[String(applicationId)]
        return next
      })
    })

    return () => {
      socket.emit('application:leave_job', { jobId })
      socket.removeAllListeners()
      socket.disconnect()
      socketRef.current = null
      setViewingByApp({})
    }
  }, [jobId, token, user?.role])

  return { viewingByApp, emitViewing, emitLeaveViewing }
}
