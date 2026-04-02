import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'

import api from '../../api/axios.instance'
import { fetchCvUrl, fetchApplicationInterviews } from '../../api/application.api'
import { ChatPanel } from '../../components/chat/ChatPanel'
import { useCandidateInbox, useCandidateInboxRefetch } from '../../contexts/CandidateInboxContext'
import { selectCurrentUser } from '../../store/authSlice'

const formatFileSize = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

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
  if (!v) return '-'
  if (v === 'yes') return 'Có'
  if (v === 'no') return 'Không'
  return v
}

const STAGE_COLORS = {
  'Mới': '#6366f1',
  'Đang xét duyệt': '#f59e0b',
  'Phỏng vấn': '#3b82f6',
  'Đề xuất': '#8b5cf6',
  'Đã tuyển': '#22c55e',
  'Không phù hợp': '#ef4444'
}

const statusInterviewLabel = (s) => {
  if (s === 'completed') return 'Đã hoàn thành'
  if (s === 'cancelled') return 'Đã hủy'
  return 'Đã lên lịch'
}

export function CandidateApplicationReviewPage() {
  const { appId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useSelector(selectCurrentUser)

  const [application, setApplication] = useState(null)
  const [fileMeta, setFileMeta] = useState(null)
  const [cvUrl, setCvUrl] = useState(null)
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reloadApplication = useCallback(async () => {
    try {
      const res = await api.get(`/applications/${appId}`)
      setApplication(res.data?.data?.application)
    } catch {
      /* ignore */
    }
  }, [appId])

  const reloadInterviews = useCallback(async () => {
    try {
      const list = await fetchApplicationInterviews(appId)
      setInterviews(Array.isArray(list) ? list : [])
    } catch {
      setInterviews([])
    }
  }, [appId])

  const load = useMemo(
    () => async () => {
      setLoading(true)
      setError(null)
      try {
        const [appRes, metaRes] = await Promise.allSettled([
          api.get(`/applications/${appId}`),
          api.get(`/applications/${appId}/file-meta`)
        ])

        if (appRes.status === 'fulfilled') {
          setApplication(appRes.value.data?.data?.application)
        }
        if (metaRes.status === 'fulfilled') {
          setFileMeta(metaRes.value.data?.data?.fileMeta)
        }

        try {
          const { url } = await fetchCvUrl(appId)
          setCvUrl(url)
        } catch {
          // CV optional
        }

        await reloadInterviews()
      } catch (e) {
        setError(e?.response?.data?.message || 'Không thể tải hồ sơ.')
      } finally {
        setLoading(false)
      }
    },
    [appId, reloadInterviews]
  )

  useEffect(() => {
    void load()
  }, [load])

  // Nếu URL có hash (vd: #section-interviews), sau khi load xong sẽ scroll tới khu vực đó.
  useEffect(() => {
    if (!application) return
    const hash = location.hash || ''
    if (!hash.startsWith('#')) return
    const id = hash.slice(1)
    if (!id) return
    const el = document.getElementById(id)
    if (!el) return
    const t = window.setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
    return () => window.clearTimeout(t)
  }, [application, location.hash])

  const { socketConnected } = useCandidateInbox()

  const refetchFromInbox = useCallback(() => {
    void reloadInterviews()
    void reloadApplication()
  }, [reloadInterviews, reloadApplication])

  useCandidateInboxRefetch(appId, refetchFromInbox)

  useEffect(() => {
    if (!appId) return
    const id = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return
      void reloadInterviews()
      void reloadApplication()
    }, 40_000)
    return () => window.clearInterval(id)
  }, [appId, reloadInterviews, reloadApplication])

  const form = application?.formData || {}
  const companiesText = Array.isArray(form.companies) ? form.companies.join(', ') : ''
  const isPdf = fileMeta?.mimeType === 'application/pdf'

  const candidateName = application?.formData?.fullName || application?.candidateId?.fullName || user?.fullName || 'Ứng viên'

  const hrNote = application?.hrNote || ''
  const jobTitle = application?.jobId?.title || 'Vị trí ứng tuyển'
  const jobCode = application?.jobId?.jobCode

  const cvTitle = fileMeta?.originalName || 'CV của ứng viên'

  /** Hiển thị theo thời gian tăng dần — Buổi 1 = sớm nhất */
  const visibleInterviews = useMemo(() => {
    const list = interviews.filter((s) => s.status !== 'cancelled')
    return [...list].sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
  }, [interviews])

  return (
    <main className="candidate-layout">
      <header className="candidate-header">
        <button type="button" className="career-back-link" onClick={() => navigate('/candidate')}>
          ← Quay lại trang ứng viên
        </button>
        <h1 className="apply-title">Xem lại đơn đăng ký</h1>
        <p className="apply-section-description" style={{ marginBottom: 4 }}>
          {candidateName} · {application?.stage || 'Mới'}
        </p>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>
          Thông báo từ HR nằm ở <strong>chuông trên thanh menu</strong>. Trang này tự làm mới khi có cập nhật & mỗi ~40s (tab đang mở).{' '}
          {socketConnected ? '● Đang kết nối realtime' : '○ Đang kết nối…'}
        </p>
      </header>

      {loading && <p className="candidate-muted">Đang tải...</p>}
      {error && <p className="error-text">{error}</p>}
      {!loading && !error && !application && <p className="error-text">Không tìm thấy hồ sơ ứng tuyển.</p>}

      {!loading && !error && application && (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginTop: 12 }}>
          <section style={{ flex: '0 0 58%' }}>
            <div className="candidate-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>{cvTitle}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
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
                  <a href={cvUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#3b82f6', fontWeight: 700, textDecoration: 'none' }}>
                    Tải xuống ↗
                  </a>
                )}
              </div>

              <div style={{ height: 500, borderRadius: 10, border: '1px solid var(--border-light)', overflow: 'hidden', background: 'var(--bg-white)' }}>
                {cvUrl && isPdf ? (
                  <iframe src={cvUrl} title="CV" style={{ width: '100%', height: '100%', border: 'none' }} />
                ) : cvUrl ? (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 48 }}>📄</div>
                    <div style={{ fontSize: 14 }}>File không thể xem trực tiếp</div>
                  </div>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    Không thể tải file CV
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: 16 }} className="candidate-card">
              <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }} id="section-notes">
                Lời nhắn của ứng viên / Ghi chú HR
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Lời nhắn:</strong> {form.messageToHR || '-'}
                </div>
                <div style={{ marginTop: 10 }}>
                  <strong style={{ color: 'var(--text-primary)' }}>Ghi chú HR:</strong> {hrNote || '-'}
                </div>
              </div>
            </div>
          </section>

          <aside style={{ flex: '1 1 0', minWidth: 0 }}>
            <div className="candidate-card" style={{ marginBottom: 14 }} id="section-interviews">
              <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10 }}>
                Lịch phỏng vấn {visibleInterviews.length > 0 ? `(${visibleInterviews.length})` : ''}
              </div>
              {visibleInterviews.length === 0 ? (
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                  Chưa có lịch. Khi HR lên lịch (có thể nhiều vòng), danh sách cập nhật tự động và có thông báo ở chuông.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {visibleInterviews.map((interview, idx) => (
                    <div
                      key={interview._id || idx}
                      style={{
                        padding: 12,
                        borderRadius: 10,
                        border: '1px solid var(--border-light)',
                        background: 'var(--bg-page)'
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#6366f1', marginBottom: 8 }}>
                        Buổi {visibleInterviews.length - idx}
                        <span style={{ marginLeft: 8, color: 'var(--text-muted)', fontWeight: 600 }}>{statusInterviewLabel(interview.status)}</span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.65 }}>
                        <div>
                          <strong>Thời gian:</strong>{' '}
                          {interview.datetime
                            ? new Date(interview.datetime).toLocaleString('vi-VN', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })
                            : '-'}
                        </div>
                        <div style={{ marginTop: 6 }}>
                          <strong>Hình thức:</strong> {interview.format === 'online' ? 'Trực tuyến' : 'Tại văn phòng'}
                        </div>
                        {interview.location ? (
                          <div style={{ marginTop: 6 }}>
                            <strong>{interview.format === 'online' ? 'Link họp' : 'Địa điểm'}:</strong> {interview.location}
                          </div>
                        ) : null}
                        {interview.interviewerName ? (
                          <div style={{ marginTop: 6 }}>
                            <strong>Người phỏng vấn:</strong> {interview.interviewerName}
                          </div>
                        ) : null}
                        {interview.noteToCandidate ? (
                          <div style={{ marginTop: 6 }}>
                            <strong>Ghi chú từ HR:</strong> {interview.noteToCandidate}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="candidate-card" id="section-stage">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>Thông tin ứng viên</div>
                <span
                  style={{
                    background: STAGE_COLORS[application.stage] || '#64748b',
                    color: '#fff',
                    padding: '4px 12px',
                    borderRadius: 99,
                    fontSize: 13,
                    fontWeight: 700
                  }}
                >
                  {application.stage || 'Mới'}
                </span>
              </div>

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
                  ['Portfolio', form.portfolioUrl ? 'Có link' : 'Không có'],
                  ['LinkedIn', form.linkedinUrl ? 'Có link' : 'Không có'],
                  ['Số điện thoại', form.phoneNumber],
                  ['Địa chỉ nhà', form.homeAddress],
                  ['Postal Code', form.postalCode],
                  ['Cho phép dùng CV & cam kết', yesNoLabel(form.cvConsent)]
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 180, fontSize: 13, color: 'var(--text-muted)', flexShrink: 0, fontWeight: 700 }}>{label}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                      {typeof value === 'string' ? (value || '-') : value}
                    </div>
                  </div>
                ))}

                {form.portfolioUrl && (
                  <div style={{ fontSize: 13 }}>
                    <a href={form.portfolioUrl} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', fontWeight: 700, textDecoration: 'none' }}>
                      Mở Portfolio ↗
                    </a>
                  </div>
                )}
                {form.linkedinUrl && (
                  <div style={{ fontSize: 13 }}>
                    <a href={form.linkedinUrl} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', fontWeight: 700, textDecoration: 'none' }}>
                      Mở LinkedIn ↗
                    </a>
                  </div>
                )}
              </div>
            </div>

          </aside>
        </div>
      )}

      {!loading && !error && application && (
        <section style={{ marginTop: 28 }} className="candidate-card">
          <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: 10, fontSize: 15 }}>
            Trao đổi với HR
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55 }}>
            Nhấn <strong>bong bóng chat</strong> góc dưới bên phải màn hình để nhắn HR — luôn gắn với hồ sơ{' '}
            <strong>{jobTitle}</strong>
            {jobCode ? ` (JD: ${jobCode})` : ''}. Cuộn trang bong bóng vẫn nổi cố định; trong khung chat dùng{' '}
            <strong>Esc</strong> hoặc <strong>Thu gọn</strong> để đóng.
          </p>
        </section>
      )}

      {!loading && !error && application && (
        <ChatPanel
          variant="chatHead"
          applicationId={appId}
          headline="Chat với HR"
          contextLine={`${jobTitle} · ${application.stage || 'Mới'} · #${String(appId).slice(-8)}`}
          showCopyApplicationId
        />
      )}
    </main>
  )
}
