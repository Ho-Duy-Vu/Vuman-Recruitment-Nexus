import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../../api/axios.instance'
import { fetchCvUrl, changeApplicationStage, updateApplicationNote } from '../../api/application.api'
import { ScheduleModal } from '../../components/application/ScheduleModal'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { HR_APPLICATION_REVIEW_NAV } from '../../constants/hrDashboardNav'
import { selectCurrentUser } from '../../store/authSlice'
import { ChatBox } from '../../components/chat/ChatBox'

const STAGES = ['Mới', 'Đang xét duyệt', 'Phỏng vấn', 'Đề xuất', 'Đã tuyển', 'Không phù hợp']

const STAGE_COLORS = {
  'Mới': '#6366f1',
  'Đang xét duyệt': '#f59e0b',
  'Phỏng vấn': '#3b82f6',
  'Đề xuất': '#8b5cf6',
  'Đã tuyển': '#22c55e',
  'Không phù hợp': '#ef4444'
}

const formatFileSize = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export const ApplicationReviewPage = () => {
  const { appId } = useParams()
  const navigate = useNavigate()
  const user = useSelector(selectCurrentUser)
  const canManage = user?.role === 'hr' || user?.role === 'admin'

  const [application, setApplication] = useState(null)
  const [fileMeta, setFileMeta] = useState(null)
  const [cvUrl, setCvUrl] = useState(null)
  const [hrNote, setHrNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [noteStatus, setNoteStatus] = useState('')
  const [showScheduleModal, setShowScheduleModal] = useState(false)

  const noteTimer = useRef(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const [appRes, metaRes] = await Promise.allSettled([
        api.get(`/applications/${appId}`),
        api.get(`/applications/${appId}/file-meta`)
      ])

      if (appRes.status === 'fulfilled') {
        const app = appRes.value.data?.data?.application
        setApplication(app)
        setHrNote(app?.hrNote || '')
      }
      if (metaRes.status === 'fulfilled') {
        setFileMeta(metaRes.value.data?.data?.fileMeta)
      }

      try {
        const { url } = await fetchCvUrl(appId)
        setCvUrl(url)
      } catch {
        // CV URL optional
      }
    } finally {
      setLoading(false)
    }
  }, [appId])

  useEffect(() => {
    load()
  }, [load])

  const handleNoteBlur = async () => {
    if (noteTimer.current) clearTimeout(noteTimer.current)
    try {
      setNoteStatus('Đang lưu...')
      await updateApplicationNote(appId, hrNote)
      setNoteStatus('Đã lưu ✓')
      setTimeout(() => setNoteStatus(''), 2000)
    } catch {
      setNoteStatus('Lỗi khi lưu')
    }
  }

  const handleStageChange = async (newStage) => {
    if (newStage === 'Phỏng vấn') {
      setShowScheduleModal(true)
      return
    }
    try {
      await changeApplicationStage(appId, newStage)
      setApplication((prev) => ({ ...prev, stage: newStage }))
    } catch (err) {
      alert(err?.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  const handleScheduleConfirm = async (scheduleData) => {
    try {
      await changeApplicationStage(appId, 'Phỏng vấn', scheduleData)
      setApplication((prev) => ({ ...prev, stage: 'Phỏng vấn' }))
      setShowScheduleModal(false)
    } catch (err) {
      alert(err?.response?.data?.message || 'Có lỗi xảy ra')
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <span style={{ color: '#64748b' }}>Đang tải...</span>
      </div>
    )
  }

  if (!application) {
    return (
      <div style={{ textAlign: 'center', padding: 60, color: '#ef4444' }}>
        Không tìm thấy hồ sơ ứng tuyển
      </div>
    )
  }

  const isPdf = fileMeta?.mimeType === 'application/pdf'
  const form = application.formData || {}
  const companiesText = Array.isArray(form.companies) ? form.companies.join(', ') : ''

  const degreeLabel = (v) => {
    if (!v) return '-'
    if (v === 'bachelor') return 'Bachelor'
    if (v === 'engineer') return 'Engineer'
    if (v === 'master') return 'Master'
    if (v === 'doctor') return 'Doctor'
    if (v === 'other') return 'Khác'
    return v
  }

  const yesNoLabel = (v) => {
    if (v === 'yes') return 'Có'
    if (v === 'no') return 'Không'
    return v || '-'
  }

  return (
    <DashboardShell title="Xem hồ sơ ứng tuyển" navItems={HR_APPLICATION_REVIEW_NAV}>
      <div style={{ background: 'var(--bg-page)' }}>
      {/* Header */}
      <div style={{ background: 'var(--bg-white)', borderBottom: '1px solid var(--border-light)', padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#64748b' }}
        >
          ←
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>
            {application.formData?.fullName || application.candidateId?.fullName || 'Ứng viên'}
          </h2>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Nộp lúc: {new Date(application.appliedAt).toLocaleString('vi-VN')}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        {canManage && appId && (
          <button
            type="button"
            onClick={() => navigate(`/hr/chats/${appId}`)}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              border: '1px solid #0d9488',
              background: '#f0fdfa',
              color: '#0f766e',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            💬 Tin nhắn với ứng viên
          </button>
        )}
        <span
          style={{
            background: STAGE_COLORS[application.stage] || '#64748b',
            color: '#fff',
            padding: '4px 12px',
            borderRadius: 99,
            fontSize: 13,
            fontWeight: 600
          }}
        >
          {application.stage || 'Mới'}
        </span>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', gap: 0, maxWidth: 1400, margin: '0 auto', padding: '24px 24px' }}>
        {/* Left panel: CV Viewer (55%) */}
          <div style={{ flex: '0 0 55%', marginRight: 20 }}>
          <div style={{ background: 'var(--bg-white)', borderRadius: 12, border: '1px solid var(--border-light)', overflow: 'hidden', height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--bg-page)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                  {fileMeta?.originalName || 'CV của ứng viên'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {fileMeta && (
                    <>
                      {formatFileSize(fileMeta.sizeBytes)}
                      {' · '}
                      {fileMeta.mimeType === 'application/pdf' ? 'PDF' : 'DOCX'}
                    </>
                  )}
                </div>
              </div>
              {cvUrl && (
                  <a
                  href={cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 13, color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}
                >
                  Tải xuống ↗
                </a>
              )}
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
              {cvUrl && isPdf ? (
                <iframe
                  src={cvUrl}
                  title="CV"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              ) : cvUrl ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12 }}>
                  <div style={{ fontSize: 48 }}>📄</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>File DOCX không thể xem trực tiếp</div>
                  <a
                    href={cvUrl}
                    download
                    style={{
                      background: '#3b82f6', color: '#fff', padding: '9px 20px',
                      borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600
                    }}
                  >
                    Tải xuống để xem
                  </a>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: 14 }}>
                  Không thể tải file CV
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right panel: HR tools (45%) */}
              <div style={{ flex: '0 0 45%', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Full application info */}
          <div style={{ background: 'var(--bg-white)', borderRadius: 12, border: '1px solid var(--border-light)', padding: '16px 20px' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              Thông tin ứng viên
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Quốc gia', form.country],
                ['Thành phố', form.city],
                ['Giới tính', form.gender],
                ['Nguồn biết đến', form.source],
                ['Kỹ năng', form.skills],
                ['Các công ty đã từng làm', companiesText],
                ['Đã từng làm ở công ty này chưa?', yesNoLabel(form.workedAtThisCompany)],
                ['Đại học', form.university],
                ['Bằng cấp', degreeLabel(form.degreeLevel)],
                ['Năm tốt nghiệp', form.graduationYear],
                [
                  'Portfolio',
                  form.portfolioUrl
                    ? <a href={form.portfolioUrl} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', fontWeight: 700, textDecoration: 'none' }}>Mở liên kết</a>
                    : '-'
                ],
                [
                  'LinkedIn',
                  form.linkedinUrl
                    ? <a href={form.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', fontWeight: 700, textDecoration: 'none' }}>Mở liên kết</a>
                    : '-'
                ],
                ['Số điện thoại', form.phoneNumber],
                ['Địa chỉ nhà', form.homeAddress],
                ['Postal Code', form.postalCode],
                ['Cho phép dùng CV & cam kết', yesNoLabel(form.cvConsent)],
                ['Lời nhắn của ứng viên', form.messageToHR || '-']
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ width: 180, fontSize: 13, color: 'var(--text-muted)', flexShrink: 0, fontWeight: 700 }}>{label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    {typeof value === 'string' ? (value || '-') : value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lời nhắn của ứng viên */}
          {/* (đã hiển thị trong Thông tin ứng viên ở trên) */}

          {/* HR Note */}
          <div style={{ background: 'var(--bg-white)', borderRadius: 12, border: '1px solid var(--border-light)', padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                Ghi chú HR
              </h3>
              {canManage && noteStatus && (
                <span style={{ fontSize: 12, color: noteStatus.startsWith('Lỗi') ? '#ef4444' : '#22c55e' }}>
                  {noteStatus}
                </span>
              )}
            </div>
            {canManage ? (
              <textarea
                value={hrNote}
                onChange={(e) => setHrNote(e.target.value)}
                onBlur={handleNoteBlur}
                placeholder="Nhập ghi chú về ứng viên này..."
                style={{
                  width: '100%',
                  minHeight: 90,
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 13,
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  lineHeight: 1.6
                }}
              />
            ) : (
              <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7, padding: '6px 2px', whiteSpace: 'pre-wrap' }}>
                {hrNote || '-'}
              </div>
            )}
          </div>

          {/* Stage buttons */}
          {canManage && (
            <div style={{ background: 'var(--bg-white)', borderRadius: 12, border: '1px solid var(--border-light)', padding: '16px 20px' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                Chuyển trạng thái
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {STAGES.map((stage) => {
                  const isCurrent = application.stage === stage
                  return (
                    <button
                      key={stage}
                      onClick={() => !isCurrent && handleStageChange(stage)}
                      disabled={isCurrent}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 7,
                        border: isCurrent ? 'none' : '1px solid #e2e8f0',
                        background: isCurrent ? STAGE_COLORS[stage] : 'var(--bg-page)',
                        color: isCurrent ? '#fff' : 'var(--text-primary)',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: isCurrent ? 'default' : 'pointer',
                        opacity: isCurrent ? 1 : 0.85
                      }}
                    >
                      {stage}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {showScheduleModal && (
        <ScheduleModal
          onConfirm={handleScheduleConfirm}
          onCancel={() => setShowScheduleModal(false)}
        />
      )}

    </div>
    </DashboardShell>
  )
}
