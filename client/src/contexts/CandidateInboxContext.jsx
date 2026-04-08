import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import {
  fetchCandidateNotifications,
  markAllCandidateNotificationsReadApi,
  markCandidateNotificationReadApi
} from '../api/candidateNotification.api'
import { selectAccessToken, selectCurrentUser } from '../store/authSlice'
import { createAppSocket } from '../utils/socketClient'

export const CANDIDATE_INBOX_EVENT = 'candidate-inbox'

const INBOX_MAX = 80

function mergeNotificationsById(serverList, localList) {
  const map = new Map()
  for (const s of serverList || []) {
    if (s?.id) map.set(s.id, { ...s })
  }
  for (const l of localList || []) {
    if (l?.id && !map.has(l.id)) map.set(l.id, { ...l })
  }
  return Array.from(map.values())
    .sort((a, b) => String(b.at).localeCompare(String(a.at)))
    .slice(0, INBOX_MAX)
}

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

  useEffect(() => {
    if (user?.role !== 'candidate') {
      setNotifications([])
      return
    }
    if (!token) {
      setNotifications([])
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const items = await fetchCandidateNotifications()
        if (!cancelled) {
          setNotifications((prev) => mergeNotificationsById(Array.isArray(items) ? items : [], prev))
        }
      } catch {
        if (!cancelled) setNotifications((prev) => prev)
      }
    })()
    return () => { cancelled = true }
  }, [user?.role, user?._id, user?.id, token])

  const markAllRead = useCallback(async () => {
    try {
      await markAllCandidateNotificationsReadApi()
    } catch {
      /* vẫn cập nhật FE */
    }
    setNotifications((prev) => prev.map((x) => ({ ...x, read: true })))
  }, [])

  const markNotificationRead = useCallback(async (id) => {
    if (!id) return
    try {
      await markCandidateNotificationReadApi(id)
    } catch {
      /* vẫn cập nhật FE */
    }
    setNotifications((prev) => prev.map((x) => (x.id === id ? { ...x, read: true } : x)))
  }, [])

  useEffect(() => {
    if (user?.role !== 'candidate' || !token) {
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
      const id =
        payload?.notificationId ||
        `${at}-${kind}-${Math.random().toString(36).slice(2, 9)}`

      setNotifications((prev) => {
        if (prev.some((x) => x.id === id)) {
          return prev
        }
        const row = { id, kind, title, message, at, read: false, applicationId }
        return [row, ...prev].slice(0, INBOX_MAX)
      })
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
