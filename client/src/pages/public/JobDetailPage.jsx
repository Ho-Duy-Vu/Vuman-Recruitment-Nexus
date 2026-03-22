import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { fetchJobById } from '../../api/job.api'
import { fetchMyApplications } from '../../api/application.api'
import { selectCurrentUser, selectIsAuthenticated } from '../../store/authSlice'
import { EmptyState } from '../../components/ui/EmptyState'
import { SkeletonCard } from '../../components/ui/SkeletonCard'

export function JobDetailPage() {
  const { jobId } = useParams()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [myApplication, setMyApplication] = useState(null)
  const [checkingMyApplication, setCheckingMyApplication] = useState(false)

  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)
  const showCandidateFooter = isAuthenticated && user?.role === 'candidate'

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

  useEffect(() => {
    if (!isAuthenticated) return
    if (user?.role !== 'candidate') return
    if (!jobId) return

    let mounted = true
    ;(async () => {
      setCheckingMyApplication(true)
      try {
        const data = await fetchMyApplications()
        const found = (data || []).find((a) => String(a.jobId?._id || a.jobId) === String(jobId))
        if (mounted) setMyApplication(found || null)
      } catch {
        if (mounted) setMyApplication(null)
      } finally {
        if (mounted) setCheckingMyApplication(false)
      }
    })()

    return () => { mounted = false }
  }, [jobId, isAuthenticated, user?.role])

  const handleApplyClick = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    if (user?.role === 'hr' || user?.role === 'admin') { navigate('/hr/kanban'); return }
    if (myApplication?._id) {
      navigate(`/candidate/applications/${myApplication._id}/review`)
      return
    }
    if (job?._id) navigate(`/apply/${job._id}`)
  }

  return (
    <main className="career-detail-layout ui-page-enter">
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

        {loading && (
          <div className="career-empty">
            <SkeletonCard rows={5} />
          </div>
        )}
        {error && !loading && (
          <EmptyState
            icon="⚠️"
            title="Không thể tải thông tin công việc"
            description="Vui lòng thử lại sau."
          />
        )}
        {!loading && !error && !job && (
          <EmptyState
            icon="🔎"
            title="Không tìm thấy công việc"
            description="Công việc có thể đã được xóa hoặc không còn hiệu lực."
          />
        )}

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
                      disabled={checkingMyApplication}
                    >
                      {myApplication?._id ? 'Theo dõi tiến độ' : 'Apply'}
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

      {showCandidateFooter && (
        <footer className="candidate-footer-follow">
          <div className="candidate-footer-title">Theo dõi chúng tôi</div>
          <div className="candidate-follow-row candidate-follow-row--footer">
            <span className="candidate-follow-icon">X</span>
            <span className="candidate-follow-icon">YouTube</span>
            <span className="candidate-follow-icon">LinkedIn</span>
            <span className="candidate-follow-icon">Facebook</span>
          </div>
          <div className="candidate-footer-links">
            <a
              href="#"
              className="candidate-about-link"
              onClick={(e) => e.preventDefault()}
            >
              Chính sách quyền riêng tư của ứng viên
            </a>
          </div>
          <div className="candidate-footer-copy">
            © {new Date().getFullYear()} Vuman Recruitment Nexus
          </div>
        </footer>
      )}
      </div>
    </main>
  )
}
