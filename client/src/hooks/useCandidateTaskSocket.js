import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'

import { selectAccessToken, selectCurrentUser } from '../store/authSlice'
import { createAppSocket } from '../utils/socketClient'

/**
 * Ứng viên: server emit `candidate:task_update` tới room `candidate:{userId}` (join sẵn khi connect).
 */
export function useCandidateTasksSocket(onReload) {
  const token = useSelector(selectAccessToken)
  const user = useSelector(selectCurrentUser)
  const reloadRef = useRef(onReload)
  reloadRef.current = onReload

  useEffect(() => {
    if (!token || user?.role !== 'candidate') return

    const socket = createAppSocket({
      auth: { token },
      transports: ['websocket', 'polling']
    })

    const handler = () => {
      if (typeof reloadRef.current === 'function') reloadRef.current()
    }

    socket.on('candidate:task_update', handler)

    return () => {
      socket.off('candidate:task_update', handler)
      socket.disconnect()
    }
  }, [token, user?.role])
}

/**
 * HR/Admin: join `application:{applicationId}` (staff:join_application) để nhận `candidate:task_update`
 * khi ứng viên nộp file hoặc khi HR/ứng viên đổi trạng thái task.
 */
export function useHrApplicationTasksSocket(applicationId, onReload) {
  const token = useSelector(selectAccessToken)
  const user = useSelector(selectCurrentUser)
  const reloadRef = useRef(onReload)
  reloadRef.current = onReload

  const appIdStr = applicationId ? String(applicationId) : ''

  useEffect(() => {
    if (!token || !appIdStr) return
    if (user?.role !== 'hr' && user?.role !== 'admin') return

    const socket = createAppSocket({
      auth: { token },
      transports: ['websocket', 'polling']
    })

    const join = () => {
      socket.emit('staff:join_application', { applicationId: appIdStr }, () => {})
    }

    const handler = (payload) => {
      if (payload?.applicationId && String(payload.applicationId) !== appIdStr) return
      if (typeof reloadRef.current === 'function') reloadRef.current()
    }

    socket.on('connect', join)
    socket.on('candidate:task_update', handler)

    if (socket.connected) join()

    return () => {
      socket.emit('staff:leave_application', { applicationId: appIdStr })
      socket.off('connect', join)
      socket.off('candidate:task_update', handler)
      socket.disconnect()
    }
  }, [token, appIdStr, user?.role])
}
