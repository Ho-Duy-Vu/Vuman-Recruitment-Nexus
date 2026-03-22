import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { fetchChatMessages, postChatMessage, markChatRead } from '../../api/chat.api'
import { createAppSocket } from '../../utils/socketClient'
import { selectAccessToken, selectCurrentUser } from '../../store/authSlice'

import './ChatPanel.css'

function formatTime(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    })
  } catch {
    return ''
  }
}

/**
 * @param {object} props
 * @param {string} props.applicationId
 * @param {'floating' | 'embedded' | 'hrSplit' | 'overlay' | 'chatHead'} props.variant — chatHead = bong bóng nổi (Messenger-style)
 * @param {string} [props.headline]
 * @param {string} [props.contextLine]
 * @param {string} [props.reviewHref] — SPA path, e.g. /hr/applications/:id/review
 * @param {boolean} [props.showCopyApplicationId]
 * @param {() => void} [props.onClose]
 */
export function ChatPanel({
  applicationId,
  variant = 'embedded',
  headline,
  contextLine,
  reviewHref,
  showCopyApplicationId = false,
  onClose
}) {
  const token = useSelector(selectAccessToken)
  const user = useSelector(selectCurrentUser)
  const [messages, setMessages] = useState([])
  const [headExpanded, setHeadExpanded] = useState(false)
  const [loading, setLoading] = useState(() => variant !== 'chatHead')
  const [error, setError] = useState(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [typing, setTyping] = useState(false)
  const [copied, setCopied] = useState(false)
  const titleId = useId()
  const socketRef = useRef(null)
  const listRef = useRef(null)
  const typingTimer = useRef(null)

  const myId = user?._id || user?.id

  const scrollBottom = () => {
    requestAnimationFrame(() => {
      const el = listRef.current
      if (el) el.scrollTop = el.scrollHeight
    })
  }

  const defaultHeadline =
    variant === 'floating'
      ? 'Chat ứng tuyển'
      : variant === 'chatHead'
        ? 'Nhắn HR'
        : 'Trao đổi với nhà tuyển dụng'
  const title = headline ?? defaultHeadline

  useEffect(() => {
    if (!applicationId || !token) return
    if (variant === 'chatHead' && !headExpanded) return

    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetchChatMessages(applicationId, 1, 100)
        const items = res.data?.data?.items || []
        if (!cancelled) setMessages(items)
        await markChatRead(applicationId)
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.message || 'Không tải được tin nhắn')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    const socket = createAppSocket({
      auth: { token },
      transports: ['websocket', 'polling']
    })
    socketRef.current = socket

    const joinChatRoom = () => {
      socket.emit('chat:join', { applicationId }, () => {})
    }

    socket.on('connect', joinChatRoom)
    socket.on('reconnect', joinChatRoom)
    if (socket.connected) {
      joinChatRoom()
    }

    socket.on('chat:message', (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(msg._id))) return prev
        return [...prev, msg]
      })
      scrollBottom()
    })

    socket.on('chat:typing', ({ typing: t }) => {
      setTyping(Boolean(t))
    })

    return () => {
      cancelled = true
      socket.off('reconnect', joinChatRoom)
      socket.removeAllListeners()
      socket.disconnect()
      socketRef.current = null
    }
  }, [applicationId, token, variant, headExpanded])

  useEffect(() => {
    scrollBottom()
  }, [messages, loading])

  useEffect(() => {
    if (variant !== 'overlay') return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [variant])

  useEffect(() => {
    if (variant !== 'overlay' || !onClose) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [variant, onClose])

  useEffect(() => {
    if (variant !== 'chatHead' || !headExpanded) return
    const onKey = (e) => {
      if (e.key === 'Escape') setHeadExpanded(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [variant, headExpanded])

  const emitTyping = useCallback(
    (v) => {
      const s = socketRef.current
      if (!s?.connected) return
      s.emit('chat:typing', { applicationId, typing: v })
    },
    [applicationId]
  )

  const onInputChange = (e) => {
    setText(e.target.value)
    emitTyping(true)
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => emitTyping(false), 1200)
  }

  const send = async () => {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setSending(true)
    setError(null)
    emitTyping(false)
    try {
      await postChatMessage(applicationId, trimmed)
      setText('')
    } catch (e) {
      setError(e?.response?.data?.message || 'Gửi thất bại')
    } finally {
      setSending(false)
    }
  }

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(String(applicationId))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const rootClass = [
    'chat-panel',
    variant === 'floating' && 'chat-panel--floating',
    variant === 'embedded' && 'chat-panel--embedded',
    variant === 'hrSplit' && 'chat-panel--hr-split',
    variant === 'overlay' && 'chat-panel--overlay-window',
    variant === 'chatHead' && 'chat-panel--chat-head'
  ]
    .filter(Boolean)
    .join(' ')

  const showClose =
    ((variant === 'floating' || variant === 'overlay') && onClose) || variant === 'chatHead'

  const panel = (
    <div className={rootClass}>
      <header className="chat-panel__head">
        <div className="chat-panel__head-row">
          <div>
            <h3 id={titleId} className="chat-panel__head-title">
              {title}
            </h3>
            {contextLine && <p className="chat-panel__head-context">{contextLine}</p>}
          </div>
          {showClose && (
            <button
              type="button"
              className="chat-panel__btn-close"
              onClick={variant === 'chatHead' ? () => setHeadExpanded(false) : onClose}
            >
              {variant === 'chatHead' ? 'Thu gọn' : 'Đóng'}
            </button>
          )}
        </div>
        {(reviewHref || showCopyApplicationId) && (
          <div className="chat-panel__head-actions">
            {reviewHref && (
              <Link to={reviewHref} className="chat-panel__link">
                Mở hồ sơ ứng tuyển đầy đủ →
              </Link>
            )}
            {showCopyApplicationId && (
              <button type="button" className="chat-panel__btn-ghost" onClick={() => void copyId()}>
                {copied ? 'Đã copy mã hồ sơ' : 'Sao chép mã hồ sơ'}
              </button>
            )}
          </div>
        )}
      </header>

      {error && <p className="chat-panel__error">{error}</p>}

      <div ref={listRef} className="chat-panel__messages">
        {loading && <p className="chat-panel__empty">Đang tải…</p>}
        {!loading && messages.length === 0 && (
          <p className="chat-panel__empty">Chưa có tin nhắn. Hãy bắt đầu trao đổi bên dưới.</p>
        )}
        {!loading &&
          messages.map((m) => {
            const mine = String(m.senderId) === String(myId)
            const fromHr = m.senderRole === 'hr'
            const label = mine ? 'Bạn' : fromHr ? 'HR' : 'Ứng viên'
            return (
              <div
                key={m._id}
                className={`chat-panel__row ${mine ? 'chat-panel__row--mine' : 'chat-panel__row--theirs'}`}
              >
                <div
                  className={`chat-panel__bubble ${mine ? 'chat-panel__bubble--mine' : 'chat-panel__bubble--theirs'}`}
                >
                  <div className="chat-panel__meta">
                    {label} · {formatTime(m.createdAt)}
                  </div>
                  <div className="chat-panel__text">{m.content}</div>
                </div>
              </div>
            )
          })}
        {typing && <p className="chat-panel__typing">Đối phương đang nhập…</p>}
      </div>

      {variant === 'chatHead' ? (
        <div className="chat-panel__composer chat-panel__composer--chat-head">
          <input
            type="text"
            className="chat-head-input"
            placeholder="Nhắn nhanh…"
            value={text}
            onChange={onInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                void send()
              }
            }}
            autoComplete="off"
            enterKeyHint="send"
          />
          <button
            type="button"
            className="chat-head-send"
            disabled={sending}
            aria-label="Gửi"
            onClick={() => void send()}
          >
            {sending ? '…' : '➤'}
          </button>
        </div>
      ) : (
        <div className="chat-panel__composer">
          <textarea
            className="chat-panel__textarea"
            rows={2}
            placeholder="Nhập tin nhắn… (Enter gửi, Shift+Enter xuống dòng)"
            value={text}
            onChange={onInputChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void send()
              }
            }}
          />
          <button type="button" className="chat-panel__send" disabled={sending} onClick={() => void send()}>
            {sending ? '…' : 'Gửi'}
          </button>
        </div>
      )}
    </div>
  )

  if (variant === 'chatHead') {
    return (
      <div className="chat-head-root">
        {headExpanded && (
          <div className="chat-head-sheet" role="dialog" aria-modal="false" aria-labelledby={titleId}>
            {panel}
          </div>
        )}
        <button
          type="button"
          className="chat-head-bubble"
          aria-label={headExpanded ? 'Thu gọn chat với HR' : 'Mở chat với HR'}
          aria-expanded={headExpanded}
          onClick={() => setHeadExpanded((v) => !v)}
        >
          <span className="chat-head-bubble__icon" aria-hidden>
            {headExpanded ? '✕' : '💬'}
          </span>
        </button>
      </div>
    )
  }

  if (variant === 'overlay') {
    return (
      <div
        className="chat-panel-overlay-root"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          type="button"
          className="chat-panel-overlay-backdrop"
          aria-label="Đóng cửa sổ chat"
          onClick={onClose}
        />
        <div className="chat-panel-overlay-shell">{panel}</div>
      </div>
    )
  }

  return panel
}
