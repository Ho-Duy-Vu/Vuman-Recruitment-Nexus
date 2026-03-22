import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { fetchChatThreads } from '../../api/chat.api'
import api from '../../api/axios.instance'
import { ChatPanel } from '../../components/chat/ChatPanel'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { useHrDashboardNavItems } from '../../hooks/useHrDashboardNavItems'
import { selectAccessToken, selectCurrentUser } from '../../store/authSlice'
import { createAppSocket } from '../../utils/socketClient'

import './HrChatsPage.css'

function formatThreadTime(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return ''
  }
}

export function HrChatsPage() {
  const { appId: appIdParam } = useParams()
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const token = useSelector(selectAccessToken)
  const isAdmin = user?.role === 'admin'
  const dashboardNavItems = useHrDashboardNavItems(isAdmin)

  const [threads, setThreads] = useState([])
  const [loadingThreads, setLoadingThreads] = useState(true)
  const [threadsError, setThreadsError] = useState(null)
  const [appHeader, setAppHeader] = useState(null)

  const loadThreads = useCallback(async () => {
    setLoadingThreads(true)
    setThreadsError(null)
    try {
      const res = await fetchChatThreads()
      const list = res.data?.data?.threads || []
      setThreads(list)
    } catch (e) {
      setThreadsError(e?.response?.data?.message || 'Không tải được danh sách tin nhắn.')
      setThreads([])
    } finally {
      setLoadingThreads(false)
    }
  }, [])

  useEffect(() => {
    void loadThreads()
  }, [loadThreads])

  const loadThreadsRef = useRef(loadThreads)
  loadThreadsRef.current = loadThreads

  useEffect(() => {
    if (!token) return
    const socket = createAppSocket({
      auth: { token },
      transports: ['websocket', 'polling']
    })
    const onThreadUpdated = () => {
      loadThreadsRef.current()
    }
    socket.on('chat:thread_updated', onThreadUpdated)
    return () => {
      socket.off('chat:thread_updated', onThreadUpdated)
      socket.disconnect()
    }
  }, [token])

  const selectedFromList = useMemo(
    () => threads.find((t) => String(t.applicationId) === String(appIdParam)),
    [threads, appIdParam]
  )

  useEffect(() => {
    if (!appIdParam) {
      setAppHeader(null)
      return
    }
    if (selectedFromList) {
      setAppHeader(null)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await api.get(`/applications/${appIdParam}`)
        const app = res.data?.data?.application
        if (!cancelled && app) {
          const cand = app.candidateId
          const job = app.jobId
          setAppHeader({
            candidateName: app.formData?.fullName || cand?.fullName || 'Ứng viên',
            jobTitle: job?.title || '—',
            stage: app.stage || 'Mới',
            jobCode: job?.jobCode || ''
          })
        }
      } catch {
        if (!cancelled) setAppHeader(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [appIdParam, selectedFromList])

  const selectThread = (id) => {
    navigate(`/hr/chats/${id}`)
  }

  const headline = selectedFromList
    ? selectedFromList.candidateName
    : appHeader?.candidateName || 'Cuộc trò chuyện'

  const contextLine = selectedFromList
    ? [
        selectedFromList.jobTitle,
        selectedFromList.jobCode ? `JD: ${selectedFromList.jobCode}` : null,
        `Trạng thái: ${selectedFromList.stage || '—'}`,
        `Mã hồ sơ: ${selectedFromList.applicationId}`
      ]
        .filter(Boolean)
        .join(' · ')
    : appHeader
      ? [
          appHeader.jobTitle,
          appHeader.jobCode ? `JD: ${appHeader.jobCode}` : null,
          `Trạng thái: ${appHeader.stage}`,
          `Mã hồ sơ: ${appIdParam}`
        ]
          .filter(Boolean)
          .join(' · ')
      : appIdParam
        ? `Mã hồ sơ: ${appIdParam}`
        : ''

  return (
    <DashboardShell title="Tin nhắn ứng viên" navItems={dashboardNavItems}>
      <div className="hr-chats-layout">
        <aside className="hr-chats-sidebar">
          <div className="hr-chats-sidebar__toolbar">
            <h2 className="hr-chats-sidebar__title">Hội thoại</h2>
            <button type="button" className="hr-chats-sidebar__refresh" onClick={() => void loadThreads()}>
              Làm mới
            </button>
          </div>
          <p className="hr-chats-sidebar__hint">
            Mỗi dòng là một <strong>hồ sơ ứng tuyển</strong> đã có tin nhắn. Chọn để trả lời; mở hồ sơ đầy đủ từ khung chat
            bên phải.
          </p>
          {loadingThreads && <p className="hr-chats-muted">Đang tải…</p>}
          {threadsError && <p className="hr-chats-error">{threadsError}</p>}
          {!loadingThreads && !threadsError && threads.length === 0 && (
            <p className="hr-chats-muted">Chưa có cuộc trò chuyện nào. Khi ứng viên hoặc bạn gửi tin từ hồ sơ, hội thoại sẽ xuất hiện tại đây.</p>
          )}
          <ul className="hr-chats-list">
            {threads.map((t) => {
              const active = String(t.applicationId) === String(appIdParam)
              return (
                <li key={t.applicationId}>
                  <button
                    type="button"
                    className={`hr-chats-list__item ${active ? 'hr-chats-list__item--active' : ''}`}
                    onClick={() => selectThread(t.applicationId)}
                  >
                    <div className="hr-chats-list__row">
                      <span className="hr-chats-list__name">{t.candidateName}</span>
                      {t.unreadFromCandidate > 0 && (
                        <span className="hr-chats-list__badge">{t.unreadFromCandidate}</span>
                      )}
                    </div>
                    <div className="hr-chats-list__job">{t.jobTitle}</div>
                    <div className="hr-chats-list__preview">{t.lastPreview || '…'}</div>
                    <div className="hr-chats-list__time">{formatThreadTime(t.lastMessageAt)}</div>
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="hr-chats-sidebar__footer">
            <Link to="/hr/candidates" className="hr-chats-link">
              ← Danh sách hồ sơ (mở theo mã)
            </Link>
          </div>
        </aside>

        <section className="hr-chats-main">
          {!appIdParam && (
            <div className="hr-chats-placeholder">
              <p className="hr-chats-placeholder__title">Chọn một hội thoại</p>
              <p className="hr-chats-muted">Hoặc mở trực tiếp từ liên kết: /hr/chats/&lt;mã hồ sơ&gt;</p>
            </div>
          )}
          {appIdParam && (
            <ChatPanel
              key={appIdParam}
              variant="hrSplit"
              applicationId={appIdParam}
              headline={headline}
              contextLine={contextLine}
              reviewHref={`/hr/applications/${appIdParam}/review`}
              showCopyApplicationId
            />
          )}
        </section>
      </div>
    </DashboardShell>
  )
}
