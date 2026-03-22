import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchMyApplications, withdrawApplication } from '../../api/application.api'
import { fetchMyCandidateTasks, uploadTaskDocument } from '../../api/candidateTask.api'
import { fetchOpenJobs } from '../../api/job.api'
import { selectCurrentUser, selectIsAuthenticated } from '../../store/authSlice'
import { EmptyState } from '../../components/ui/EmptyState'
import { SkeletonCard } from '../../components/ui/SkeletonCard'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { StageTimeline } from '../../components/candidate/StageTimeline'
import { useOpenJobsSocket } from '../../hooks/useOpenJobsSocket'
import { useCandidateTasksSocket } from '../../hooks/useCandidateTaskSocket'

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

const taskStatusLabel = (status) => {
  if (status === 'pending') return 'Chờ xử lý'
  if (status === 'in_progress') return 'Đang làm'
  if (status === 'submitted') return 'Đã nộp'
  if (status === 'approved') return 'Đã duyệt'
  if (status === 'rejected') return 'Từ chối'
  if (status === 'completed') return 'Hoàn thành'
  return status || '—'
}

export function CandidatePage() {
  const navigate = useNavigate()
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [applications, setApplications] = useState([])
  const [openJobs, setOpenJobs] = useState([])
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [suggestedError, setSuggestedError] = useState(null)
  const [withdrawingId, setWithdrawingId] = useState(null)

  const [tasksLoading, setTasksLoading] = useState(false)
  const [tasksError, setTasksError] = useState(null)
  const [tasks, setTasks] = useState([])
  const [uploadingTaskId, setUploadingTaskId] = useState(null)
  /** Chỉ mở một task — gọn khi có nhiều nhiệm vụ */
  const [expandedTaskId, setExpandedTaskId] = useState(null)

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

  useEffect(() => {
    if (!isAuthenticated) return
    if (user?.role !== 'candidate') return

    let mounted = true
    setTasksLoading(true)
    setTasksError(null)

    ;(async () => {
      try {
        const data = await fetchMyCandidateTasks()
        if (mounted) setTasks(data?.items || [])
      } catch (e) {
        if (mounted) setTasksError(e?.response?.data?.message || 'Không thể tải nhiệm vụ của bạn.')
      } finally {
        if (mounted) setTasksLoading(false)
      }
    })()

    return () => { mounted = false }
  }, [isAuthenticated, user?.id, user?.role])

  const reloadSuggestedOpenJobs = useCallback(async () => {
    try {
      const jobs = await fetchOpenJobs()
      setOpenJobs(jobs || [])
      setSuggestedError(null)
    } catch {
      setSuggestedError('Không thể tải danh sách công việc đang tuyển.')
    }
  }, [])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoadingJobs(true)
      setSuggestedError(null)
      try {
        const jobs = await fetchOpenJobs()
        if (mounted) setOpenJobs(jobs || [])
      } catch {
        if (mounted) setSuggestedError('Không thể tải danh sách công việc đang tuyển.')
      } finally {
        if (mounted) setLoadingJobs(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  useOpenJobsSocket(() => {
    void reloadSuggestedOpenJobs()
  })

  const reloadMyTasks = useCallback(async () => {
    if (user?.role !== 'candidate') return
    try {
      const data = await fetchMyCandidateTasks()
      setTasks(data?.items || [])
    } catch {
      /* ignore */
    }
  }, [user?.role])

  useCandidateTasksSocket(reloadMyTasks)

  const appliedJobIds = useMemo(() => {
    return new Set(
      applications.map((a) => String(a.jobId?._id || a.jobId || ''))
    )
  }, [applications])

  const suggestedJobs = useMemo(() => {
    if (!openJobs?.length) return []
    const list = openJobs
      .filter((j) => !appliedJobIds.has(String(j._id)))
      .slice(0, 2)
    return list
  }, [openJobs, appliedJobIds])

  const handleViewApplication = (appId) => {
    navigate(`/candidate/applications/${appId}/review`)
  }

  const handleWithdraw = async (appId, jobTitle) => {
    // eslint-disable-next-line no-alert
    const ok = window.confirm(`Bạn có chắc chắn rút đơn ứng tuyển: ${jobTitle}?`)
    if (!ok) return

    setWithdrawingId(appId)
    setSuggestedError(null)
    setError(null)
    try {
      await withdrawApplication(appId)
      // Reload candidate applications
      const data = await fetchMyApplications()
      setApplications(data)
      // Đồng bộ lại tasks vì backend sẽ xóa tasks gắn với application đã rút
      const taskData = await fetchMyCandidateTasks()
      setTasks(taskData?.items || [])
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể rút đơn ứng tuyển. Vui lòng thử lại sau.')
    } finally {
      setWithdrawingId(null)
    }
  }

  const docTypeLabel = (t) => {
    if (t === 'certificate') return 'Chứng chỉ'
    if (t === 'personal_profile') return 'Hồ sơ cá nhân'
    if (t === 'degree') return 'Bằng cấp'
    if (t === 'other') return 'Tài liệu khác'
    return t || '-'
  }

  const handleUploadTaskDoc = async (taskId, docType, file) => {
    if (!file) return
    setUploadingTaskId(taskId)
    setTasksError(null)
    try {
      await uploadTaskDocument(taskId, { docType, file })
      const data = await fetchMyCandidateTasks()
      setTasks(data?.items || [])
    } catch (e) {
      setTasksError(e?.response?.data?.message || 'Tải tài liệu thất bại. Vui lòng thử lại sau.')
    } finally {
      setUploadingTaskId(null)
    }
  }

  return (
    <main className="candidate-layout ui-page-enter">
      <header className="candidate-header">
        <h1 className="apply-title">Trang ứng viên</h1>
        <p className="apply-section-description">
          Quản lý hồ sơ, theo dõi vị trí đã ứng tuyển và rút đơn khi cần.
        </p>
      </header>

      <div className="candidate-dashboard-grid">
        {/* Left column */}
        <section className="candidate-left-col">
          <div className="candidate-welcome">
            Welcome, {user?.fullName || user?.email || 'Ứng viên'}
          </div>

          <section className="candidate-card candidate-tasks-card">
            <div className="candidate-tasks-card-head">
              <h2 className="candidate-section-title" style={{ marginBottom: 0 }}>
                Nhiệm vụ của tôi
                {!tasksLoading && tasks.length > 0 ? (
                  <span className="candidate-tasks-count"> ({tasks.length})</span>
                ) : null}
              </h2>
              {!tasksLoading && tasks.length > 3 ? (
                <span className="candidate-tasks-hint">Bấm dòng để mở chi tiết &amp; nộp file</span>
              ) : null}
            </div>
            {tasksLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <SkeletonCard rows={1} />
                <SkeletonCard rows={1} />
                <SkeletonCard rows={1} />
              </div>
            )}
            {tasksError && <p className="error-text">{tasksError}</p>}

            {!tasksLoading && !tasksError && tasks.length === 0 && (
              <EmptyState
                icon="📭"
                title="Bạn chưa có nhiệm vụ nào."
                description="Khi HR tạo task cho bạn, hệ thống sẽ hiển thị tại đây."
              />
            )}

            {!tasksLoading && !tasksError && tasks.length > 0 && (
              <div className="candidate-tasks-scroll">
                <div className="candidate-tasks-list candidate-tasks-list--compact">
                  {tasks.map((t) => {
                    const tid = String(t._id)
                    const isOpen = expandedTaskId === tid
                    const docCount = Array.isArray(t.documents) ? t.documents.length : 0
                    return (
                      <div
                        key={tid}
                        className={`candidate-task-item ${isOpen ? 'candidate-task-item--open' : ''}`}
                      >
                        <button
                          type="button"
                          className="candidate-task-summary"
                          onClick={() => setExpandedTaskId((prev) => (prev === tid ? null : tid))}
                          aria-expanded={isOpen}
                        >
                          <span className="candidate-task-chevron" aria-hidden>
                            {isOpen ? '▼' : '▶'}
                          </span>
                          <div className="candidate-task-summary-text">
                            <span className="candidate-task-title candidate-task-title--truncate" title={t.title}>
                              {t.title}
                            </span>
                            <span className="candidate-task-meta-mini">
                              {t.dueDate
                                ? `Hạn ${new Date(t.dueDate).toLocaleDateString('vi-VN')}`
                                : 'Không hạn'}
                              {' · '}
                              {docCount} file
                            </span>
                          </div>
                          <span className={`candidate-task-status candidate-task-status--${t.status}`}>
                            {taskStatusLabel(t.status)}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="candidate-task-details">
                            {t.description ? (
                              <div className="candidate-task-desc">{t.description}</div>
                            ) : null}

                            <div className="candidate-task-doc-section">
                              <div className="candidate-task-doc-title">Giấy tờ</div>

                              {Array.isArray(t.documents) && t.documents.length > 0 ? (
                                <div className="candidate-doc-list">
                                  {t.documents.map((d) => (
                                    <a
                                      key={d._id || d.storedPath}
                                      href={d.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="candidate-doc-item"
                                    >
                                      {docTypeLabel(d.docType)}: {d.originalName}
                                    </a>
                                  ))}
                                </div>
                              ) : (
                                <div className="candidate-muted">Chưa có tài liệu nào.</div>
                              )}

                              <form
                                className="candidate-task-upload"
                                onSubmit={async (e) => {
                                  e.preventDefault()
                                  const form = e.currentTarget
                                  const docType = form.querySelector('select[name="docType"]')?.value || 'other'
                                  const fileInput = form.querySelector('input[type="file"][name="file"]')
                                  const file = fileInput?.files?.[0]
                                  await handleUploadTaskDoc(t._id, docType, file)
                                  form.reset()
                                }}
                              >
                                <select
                                  name="docType"
                                  className="career-filter candidate-task-upload-select"
                                  defaultValue="certificate"
                                >
                                  <option value="certificate">Chứng chỉ</option>
                                  <option value="personal_profile">Hồ sơ cá nhân</option>
                                  <option value="degree">Bằng cấp</option>
                                  <option value="other">Tài liệu khác</option>
                                </select>
                                <input
                                  type="file"
                                  name="file"
                                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                  className="career-search-input candidate-task-upload-file"
                                />
                                <button
                                  type="submit"
                                  className="btn btn-primary candidate-task-upload-btn"
                                  disabled={uploadingTaskId === t._id}
                                >
                                  {uploadingTaskId === t._id ? 'Đang tải...' : 'Gửi tài liệu'}
                                </button>
                              </form>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </section>

          <section className="candidate-card candidate-applications-card">
            <div className="candidate-applications-header">
              <h2 className="candidate-section-title" style={{ marginBottom: 0 }}>
                Các đơn ứng tuyển ({applications.length})
              </h2>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/jobs')}>
                Tìm thêm việc làm
              </button>
            </div>

            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <SkeletonCard rows={2} />
                <SkeletonCard rows={2} />
              </div>
            )}
            {error && <p className="error-text">{error}</p>}

            {!loading && !error && applications.length === 0 && (
              <EmptyState
                icon="📝"
                title="Bạn chưa ứng tuyển vị trí nào."
                description="Hãy chọn một vị trí phù hợp và nộp hồ sơ."
              />
            )}

            {!loading && !error && applications.length > 0 && (
              <div className="candidate-table-wrap">
                <table className="candidate-table">
                  <thead>
                    <tr>
                      <th>Giai đoạn</th>
                      <th>Vị trí</th>
                      <th>Ngày nộp</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => {
                      const job = app.jobId
                      const appliedAt = app.appliedAt ? new Date(app.appliedAt) : null
                      const canWithdraw = app.stage !== 'Đã tuyển' && app.stage !== 'Không phù hợp'
                      const isWithdrawing = withdrawingId === app._id
                      return (
                        <tr key={app._id}>
                          <td style={{ minWidth: 200 }}>
                            <StageTimeline currentStage={app.stage} />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="candidate-table-job-link"
                              onClick={() => {
                                if (!job?._id) return
                                navigate(`/jobs/${job._id}`)
                              }}
                              disabled={!job?._id}
                              title={job?.title || ''}
                            >
                              {job?.title || 'Không rõ vị trí'}
                            </button>
                            <div className="candidate-table-sub">
                              {job?.location || 'Không rõ địa điểm'} · {employmentTypeLabel(job?.employmentType)}
                              {job?.workMode ? ` · ${workModeLabel(job.workMode)}` : ''}
                            </div>
                          </td>
                          <td>{appliedAt ? appliedAt.toLocaleDateString('vi-VN') : 'Không rõ'}</td>
                          <td>
                            <div className="candidate-table-actions">
                              <button
                                type="button"
                                className="btn btn-secondary"
                                disabled={!canWithdraw || isWithdrawing}
                                onClick={() => handleWithdraw(app._id, job?.title || '')}
                              >
                                {isWithdrawing ? (
                                  <>
                                    <LoadingSpinner size={14} label="Đang rút..." />
                                    Đang rút...
                                  </>
                                ) : 'Rút đơn'}
                              </button>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => handleViewApplication(app._id)}
                              >
                                Xem lại đơn đăng ký
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </section>

        {/* Right column */}
        <aside className="candidate-right-col">
          <section className="candidate-card candidate-about-card">
            <div className="candidate-about-title">Giới thiệu</div>
            <div className="candidate-about-media">
              Video / Hình ảnh
            </div>
            <div className="candidate-about-body">
              Vuman cung cấp giải pháp <strong>software solution system ERP</strong> tích hợp cho quy trình tuyển dụng,
              quản lý dữ liệu ứng viên và vận hành hệ thống HRM/ATS hiệu quả.
              <div style={{ marginTop: 12 }}>
                <a href="https://example.com" target="_blank" rel="noreferrer" className="candidate-about-link">
                  Xem thêm →
                </a>
              </div>
            </div>
          </section>

          <section className="candidate-card candidate-follow-card">
            <div className="candidate-follow-title">Theo dõi chúng tôi</div>
            <div className="candidate-follow-row">
              <span className="candidate-follow-icon">X</span>
              <span className="candidate-follow-icon">YouTube</span>
              <span className="candidate-follow-icon">LinkedIn</span>
              <span className="candidate-follow-icon">Facebook</span>
            </div>
          </section>
        </aside>
      </div>

      {/* Suggested Jobs */}
      <section className="candidate-card candidate-suggested-card" style={{ marginTop: 20 }}>
        <div className="candidate-suggested-header">
          <h2 className="candidate-section-title" style={{ marginBottom: 0 }}>
            Gợi ý việc làm — Dựa trên vị trí bạn đã ứng tuyển ({applications.length})
          </h2>
        </div>

        {loadingJobs && <p className="candidate-muted">Đang tải gợi ý...</p>}
        {suggestedError && <p className="error-text" style={{ marginTop: 0 }}>{suggestedError}</p>}

        {!loadingJobs && suggestedJobs.length === 0 && applications.length > 0 && (
          <p className="candidate-muted">Không có gợi ý phù hợp ngay lúc này.</p>
        )}

        {!loadingJobs && suggestedJobs.length > 0 && (
          <div className="candidate-suggested-grid">
            {suggestedJobs.map((j) => (
              <div key={j._id} className="candidate-suggested-item">
                <div className="candidate-suggested-item-title">{j.title}</div>
                <div className="candidate-suggested-item-meta">
                  {j.location || 'Không rõ địa điểm'} · {employmentTypeLabel(j.employmentType)}
                  {j.workMode ? ` · ${workModeLabel(j.workMode)}` : ''}
                </div>
                <div className="candidate-suggested-item-id">Mã JD: {j.jobCode || j._id}</div>
                <button type="button" className="btn btn-primary" onClick={() => navigate(`/jobs/${j._id}`)}>
                  Ứng tuyển
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer className="candidate-footer-follow">
        <div className="candidate-footer-title">Theo dõi chúng tôi</div>
        <div className="candidate-follow-row candidate-follow-row--footer">
          <span className="candidate-follow-icon">X</span>
          <span className="candidate-follow-icon">YouTube</span>
          <span className="candidate-follow-icon">LinkedIn</span>
          <span className="candidate-follow-icon">Facebook</span>
        </div>
        <div className="candidate-footer-links">
          <a href="#" className="candidate-about-link" onClick={(e) => e.preventDefault()}>
            Chính sách quyền riêng tư của ứng viên
          </a>
        </div>
        <div className="candidate-footer-copy">© {new Date().getFullYear()} Vuman Recruitment Nexus</div>
      </footer>

    </main>
  )
}

