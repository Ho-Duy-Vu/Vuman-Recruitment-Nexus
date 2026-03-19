import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { fetchJobById } from '../../api/job.api'
import { selectCurrentUser, selectIsAuthenticated } from '../../store/authSlice'

export function JobDetailPage() {
  const { jobId } = useParams()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showApplyChoice, setShowApplyChoice] = useState(false)

  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await fetchJobById(jobId)
        if (mounted) setJob(data)
      } catch (err) {
        if (mounted) setError(err.message || 'Không thể tải công việc')
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [jobId])

  const handleApplyClick = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (user?.role === 'hr' || user?.role === 'admin') { navigate('/hr/kanban'); return }
    setShowApplyChoice(true)
  }

  return (
    <main className="career-detail-layout">
      <div className="jobdetail-hero">
        <div className="jobdetail-hero-inner">
          <div className="jobdetail-hero-title">Like No Place You’ve<br />Ever Worked.</div>
          <div className="jobdetail-hero-strip" aria-hidden="true">
            <div className="jobdetail-hero-thumb" />
            <div className="jobdetail-hero-thumb" />
            <div className="jobdetail-hero-thumb" />
          </div>
        </div>
      </div>

      <div className="jobdetail-body">
        <button type="button" className="career-back-link" onClick={() => navigate('/jobs')}>
          ← Quay lại tin tuyển dụng
        </button>

        {loading && <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Đang tải thông tin công việc...</p>}
        {error && !loading && <p className="error-text">Không thể tải thông tin công việc. Vui lòng thử lại.</p>}
        {!loading && !error && !job && <p style={{ color: 'var(--text-muted)' }}>Không tìm thấy công việc.</p>}

        {!loading && !error && job && (
          <div className="jobdetail-grid">
            <div>
              <div className="career-detail-card">
                <div className="career-detail-card-header">
                  <div className="career-detail-card-header-left">
                    <h1 className="career-detail-title">
                      {job.title}{' '}
                      <span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>↗</span>
                    </h1>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {job.department || '—'}
                    </div>
                  </div>
                  <div className="career-detail-header-actions">
                    <button
                      className="btn btn-primary career-detail-apply-btn"
                      type="button"
                      onClick={handleApplyClick}
                    >
                      Ứng tuyển
                    </button>
                  </div>
                </div>

                <div className="career-detail-meta-wrap">
                  <div className="career-detail-meta-grid">
                    <div className="career-detail-meta-item">
                      <span>📍</span>
                      <span>{job.location || 'Không rõ địa điểm'}</span>
                    </div>
                    <div className="career-detail-meta-item">
                      <span>💼</span>
                      <span>
                        {job.employmentType === 'full_time'
                          ? 'Full time'
                          : job.employmentType === 'part_time'
                            ? 'Part time'
                            : job.employmentType || 'Full time'}
                        {job.workMode ? ` · ${job.workMode}` : ''}
                      </span>
                    </div>
                    <div className="career-detail-meta-item">
                      <span>🕐</span>
                      <span>
                        {job.createdAt
                          ? new Date(job.createdAt).toLocaleDateString('vi-VN')
                          : 'Không rõ ngày đăng'}
                      </span>
                    </div>
                    <div className="career-detail-meta-item">
                      <span>🗒</span>
                      <span>{job.jobCode || job._id}</span>
                    </div>
                  </div>
                </div>

                <div className="job-description">
                  <h2>Mô tả công việc</h2>
                  <p>{job.description}</p>

                  {Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0 && (
                    <div className="job-meta" style={{ marginTop: 20 }}>
                      <h3>Kỹ năng yêu cầu</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                        {job.requiredSkills.map((skill) => (
                          <span
                            key={skill}
                            style={{
                              fontSize: 13,
                              background: '#f0fdf4',
                              color: '#065f46',
                              border: '1px solid #bbf7d0',
                              borderRadius: 4,
                              padding: '3px 10px'
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <aside className="jobdetail-sidebar">
              <div className="jobdetail-sidebar-card">
                <div className="jobdetail-sidebar-title">Giới thiệu</div>
                <div className="jobdetail-sidebar-media">Video / Hình ảnh</div>
                <div className="jobdetail-sidebar-body">
                  Vuman xây dựng nền tảng tuyển dụng hiện đại, giúp ứng viên và HR làm việc hiệu quả hơn.
                  Tìm hiểu thêm về văn hóa, môi trường làm việc và các cơ hội phát triển tại Vuman.
                </div>
              </div>
            </aside>
          </div>
        )}

      {/* Apply choice modal */}
      {showApplyChoice && job && (
        <div className="apply-choice-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowApplyChoice(false) }}>
          <div className="apply-choice-modal">
            <button type="button" className="apply-choice-close" onClick={() => setShowApplyChoice(false)}>✕</button>
            <h2 className="apply-choice-title">Bắt đầu hồ sơ ứng tuyển</h2>
            <p className="apply-choice-subtitle">{job.title}</p>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%', height: 48, fontSize: 15, marginBottom: 12 }}
              onClick={() => navigate(`/apply/${job._id}`, { state: { mode: 'new' } })}
            >
              Nộp hồ sơ mới
            </button>
            <div className="apply-choice-divider" />
            <button
              type="button"
              className="btn btn-secondary-blue"
              style={{ width: '100%', height: 48, fontSize: 15, marginTop: 12 }}
              onClick={() => navigate(`/apply/${job._id}`, { state: { mode: 'reuse' } })}
            >
              Dùng hồ sơ lần trước
            </button>
          </div>
        </div>
      )}
      </div>
    </main>
  )
}
