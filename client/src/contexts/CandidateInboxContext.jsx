import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import { selectAccessToken, selectCurrentUser } from '../store/authSlice'
import { createAppSocket } from '../utils/socketClient'

export const CANDIDATE_INBOX_EVENT = 'candidate-inbox'

const defaultCtx = {
  notifications: [],
  markAllRead: () => {},
  markNotificationRead: () => {},
  socketConnected: false,
  inboxEventName: CANDIDATE_INBOX_EVENT
}

const CandidateInboxContext = createContext(defaultCtx)

export function CandidateInboxProvider({ children }) {
  const user = useSelector(selectCurrentUser)
  const token = useSelector(selectAccessToken)
  const [notifications, setNotifications] = useState([])
  const [socketConnected, setSocketConnected] = useState(false)

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((x) => ({ ...x, read: true })))
  }, [])

  const markNotificationRead = useCallback((id) => {
    if (!id) return
    setNotifications((prev) => prev.map((x) => (x.id === id ? { ...x, read: true } : x)))
  }, [])

  useEffect(() => {
    if (user?.role !== 'candidate' || !token) {
      setNotifications([])
      setSocketConnected(false)
      return
    }

    const socket = createAppSocket({
      auth: { token },
      transports: ['websocket', 'polling']
    })

    const onPayload = (payload) => {
      const kind = payload?.kind || 'info'
      const title = payload?.title || 'Thông báo từ HR'
      const message = payload?.message || ''
      const at = payload?.at || new Date().toISOString()
      const applicationId = payload?.applicationId
      const id = `${at}-${kind}-${Math.random().toString(36).slice(2, 9)}`
      setNotifications((prev) =>
        [{ id, kind, title, message, at, read: false, applicationId }, ...prev].slice(0, 80)
      )
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(CANDIDATE_INBOX_EVENT, { detail: payload }))
      }
    }

    socket.on('connect', () => setSocketConnected(true))
    socket.on('disconnect', () => setSocketConnected(false))
    socket.on('candidate:application_update', onPayload)

    return () => {
      socket.removeAllListeners()
      socket.disconnect()
      setSocketConnected(false)
    }
  }, [user?.role, token])

  const value = useMemo(() => {
    if (user?.role !== 'candidate') {
      return defaultCtx
    }
    return {
      notifications,
      markAllRead,
      markNotificationRead,
      socketConnected,
      inboxEventName: CANDIDATE_INBOX_EVENT
    }
  }, [user?.role, notifications, markAllRead, markNotificationRead, socketConnected])

  return <CandidateInboxContext.Provider value={value}>{children}</CandidateInboxContext.Provider>
}

export function useCandidateInbox() {
  return useContext(CandidateInboxContext)
}

/** Trang chi tiết hồ sơ: refetch khi có sự kiện inbox cho đúng applicationId */
export function useCandidateInboxRefetch(appId, onTick) {
  useEffect(() => {
    if (!appId || typeof onTick !== 'function') return
    const handler = (e) => {
      const p = e.detail
      if (String(p?.applicationId) !== String(appId)) return
      onTick(p)
    }
    window.addEventListener(CANDIDATE_INBOX_EVENT, handler)
    return () => window.removeEventListener(CANDIDATE_INBOX_EVENT, handler)
  }, [appId, onTick])
}
