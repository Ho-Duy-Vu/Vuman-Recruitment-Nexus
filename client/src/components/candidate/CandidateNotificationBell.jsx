import { useEffect, useRef, useState } from 'react'
import { AiFillBell } from 'react-icons/ai'
import { useNavigate } from 'react-router-dom'

import { useCandidateInbox } from '../../contexts/CandidateInboxContext'

/**
 * Chuông + dropdown — dữ liệu từ `CandidateInboxContext` (thanh menu).
 */
export function CandidateNotificationBell({ notifications = [], onMarkAllRead }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const navigate = useNavigate()
  const candidateInbox = useCandidateInbox()

  useEffect(() => {
    const onDoc = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const unread = notifications.filter((x) => !x.read).length

  const handleOpenNotification = (n) => {
    // Close dropdown first for better UX.
    setOpen(false)

    candidateInbox?.markNotificationRead?.(n?.id)

    const applicationId = n?.applicationId
    if (!applicationId) return

    const hash =
      n?.kind === 'interview' ? '#section-interviews' : n?.kind === 'stage' ? '#section-stage' : '#section-stage'

    navigate(`/candidate/applications/${applicationId}/review${hash}`)
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        type="button"
        aria-label="Thông báo"
        onClick={() => setOpen((v) => !v)}
        style={{
          position: 'relative',
          width: 42,
          height: 42,
          borderRadius: 99,
          border: '1px solid var(--border-light)',
          background: 'var(--bg-white)',
          cursor: 'pointer',
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
          color: 'var(--text-primary)'
        }}
      >
        <AiFillBell size={22} aria-hidden />
        {unread > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              minWidth: 18,
              height: 18,
              padding: '0 5px',
              borderRadius: 99,
              background: '#ef4444',
              color: '#fff',
              fontSize: 11,
              fontWeight: 800,
              lineHeight: '18px',
              textAlign: 'center'
            }}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            width: 320,
            maxHeight: 360,
            overflowY: 'auto',
            background: 'var(--bg-white)',
            border: '1px solid var(--border-light)',
            borderRadius: 12,
            boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
            zIndex: 100,
            padding: 10
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 800, fontSize: 13 }}>Thông báo từ HR</span>
            {notifications.length > 0 && (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: 12, padding: '4px 10px' }}
                onClick={() => onMarkAllRead?.()}
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>
          {notifications.length === 0 && (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', padding: '8px 4px' }}>
              Chưa có thông báo. Khi HR đổi trạng thái, thêm lịch PV, ghi chú hoặc nhắn tin, bạn sẽ thấy tại đây.
            </p>
          )}
          {notifications.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => handleOpenNotification(n)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 8px',
                borderRadius: 8,
                marginBottom: 6,
                background: n.read ? 'transparent' : 'rgba(99,102,241,0.08)',
                borderBottom: '1px solid var(--border-light)',
                borderLeft: 'none',
                borderRight: 'none',
                borderTop: 'none',
                cursor: 'pointer',
                color: 'inherit'
              }}
              aria-label={`Mở thông báo: ${n.title || 'thông báo'}`}
            >
              <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text-primary)' }}>{n.title}</div>
              {n.message ? (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.45 }}>{n.message}</div>
              ) : null}
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 6 }}>
                {new Date(n.at).toLocaleString('vi-VN')}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
