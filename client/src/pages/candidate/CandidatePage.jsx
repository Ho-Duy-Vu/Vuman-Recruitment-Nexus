import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchCvUrl, fetchMyApplications } from '../../api/application.api'
import { selectCurrentUser, selectIsAuthenticated } from '../../store/authSlice'

const employmentTypeLabel = (v) => {
  if (v === 'full_time') return 'Full time'
  if (v === 'part_time') return 'Part time'
  return v || '-'
}

const workModeLabel = (v) => {
  if (v === 'onsite') return 'Onsite'
  if (v === 'hybrid') return 'Hybrid'
  if (v === 'remote') return 'Remote'
  return v || '-'
}

export function CandidatePage() {
  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [applications, setApplications] = useState([])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    // Role guard: HR/Admin không được truy cập trang ứng viên
    if (user?.role !== 'candidate') {
      if (user?.role === 'hr' || user?.role === 'admin') {
        navigate('/hr/kanban')
      } else {
        navigate('/jobs')
      }
      return
    }

    let mounted = true
    ;(async () => {
      try {
        const data = await fetchMyApplications()
        if (mounted) setApplications(data)
      } catch (err) {
        if (mounted) setError('Không thể tải danh sách hồ sơ đã ứng tuyển. Vui lòng thử lại sau.')
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [isAuthenticated, user?.role, navigate])

  const handleViewCv = async (appId) => {
    try {
      const { url } = await fetchCvUrl(appId)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      setError('Không thể tải CV. Vui lòng thử lại sau.')
    }
  }

  return (
    <main className="candidate-layout">
      <header className="candidate-header">
        <h1 className="apply-title">Trang ứng viên</h1>
        <p className="apply-section-description">Quản lý hồ sơ và theo dõi các vị trí đã ứng tuyển.</p>
      </header>

      <div className="candidate-dashboard">
        {/* Left: Profile */}
        <aside>
          <section className="candidate-profile-card">
            <h2 className="candidate-section-title">Hồ sơ của bạn</h2>
            <div className="candidate-info-grid">
              <div className="candidate-info-item">
                <strong>Email</strong>
                <span>{user?.email || 'Chưa có'}</span>
              </div>
              <div className="candidate-info-item">
                <strong>Họ và tên</strong>
                <span>{user?.fullName || 'Chưa có'}</span>
              </div>
              <div className="candidate-info-item">
                <strong>Vai trò</strong>
                <span>Ứng viên</span>
              </div>
            </div>
          </section>
        </aside>

        {/* Right: Applications */}
        <section className="candidate-apps-card">
          <div className="candidate-apps-header">
            <h2 className="candidate-section-title">Các vị trí đã ứng tuyển</h2>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/jobs')}>
              Tìm thêm việc làm
            </button>
          </div>

          {loading && <p className="candidate-muted">Đang tải danh sách...</p>}
          {error && <p className="error-text">{error}</p>}

          {!loading && !error && applications.length === 0 && (
            <p className="candidate-muted">Bạn chưa ứng tuyển vị trí nào.</p>
          )}

          {!loading && !error && applications.length > 0 && (
            <div>
              {applications.map((app) => {
                const job = app.jobId
                const appliedAt = app.appliedAt ? new Date(app.appliedAt) : null
                return (
                  <div key={app._id} className="candidate-app-row">
                    <div className="candidate-app-row-top">
                      <div style={{ minWidth: 0 }}>
                        <h3
                          className="candidate-app-title"
                          onClick={() => job?._id && navigate(`/jobs/${job._id}`)}
                          title={job?.title || ''}
                        >
                          {job?.title || 'Không rõ vị trí'}
                        </h3>

                        <div className="candidate-app-meta-grid">
                          <div className="candidate-meta-item">
                            <span>📍</span>
                            <span>{job?.location || 'Không rõ địa điểm'}</span>
                          </div>
                          <div className="candidate-meta-item">
                            <span>💼</span>
                            <span>
                              {employmentTypeLabel(job?.employmentType)}
                              {job?.workMode ? ` · ${workModeLabel(job.workMode)}` : ''}
                            </span>
                          </div>
                          <div className="candidate-meta-item">
                            <span>🗓</span>
                            <span>
                              Ngày ứng tuyển: {appliedAt ? appliedAt.toLocaleDateString('vi-VN') : 'Không rõ'}
                            </span>
                          </div>
                          <div className="candidate-meta-item">
                            <span>📌</span>
                            <span>
                              Trạng thái: <span className="candidate-stage-pill">{app.stage}</span>
                            </span>
                          </div>
                        </div>

                        <div className="candidate-app-code">
                          Mã công việc: {job?.jobCode || job?._id || String(app.jobId)}
                        </div>
                      </div>

                      <div className="candidate-app-actions">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => job?._id && navigate(`/jobs/${job._id}`)}
                          disabled={!job?._id}
                        >
                          Xem tin
                        </button>
                        <button type="button" className="btn btn-primary" onClick={() => void handleViewCv(app._id)}>
                          Xem CV
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

