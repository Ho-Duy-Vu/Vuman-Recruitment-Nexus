import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector } from 'react-redux'

import { fetchAllApplicationsForHR } from '../../api/application.api'
import {
  createCandidateTask,
  deleteCandidateTask,
  fetchCandidateTasks,
  updateCandidateTask
} from '../../api/candidateTask.api'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { useHrDashboardNavItems } from '../../hooks/useHrDashboardNavItems'
import { useHrApplicationTasksSocket } from '../../hooks/useCandidateTaskSocket'
import { selectCurrentUser } from '../../store/authSlice'
import { EmptyState } from '../../components/ui/EmptyState'
import { SkeletonCard } from '../../components/ui/SkeletonCard'

const stageLabel = (s) => s || '-'

const genderLabel = (g) => {
  if (!g) return '-'
  if (g === 'Nam') return 'Nam'
  if (g === 'Nữ') return 'Nữ'
  if (g === 'Không tiết lộ') return 'Không tiết lộ'
  return g
}

const docTypeLabel = (t) => {
  if (t === 'certificate') return 'Chứng chỉ'
  if (t === 'personal_profile') return 'Hồ sơ cá nhân'
  if (t === 'degree') return 'Bằng cấp'
  if (t === 'other') return 'Tài liệu khác'
  return t || '-'
}

export function CandidatesDashboardPage() {
  const user = useSelector(selectCurrentUser)
  const isAdmin = user?.role === 'admin'
  const dashboardNavItems = useHrDashboardNavItems(isAdmin)

  const [apps, setApps] = useState([])
  const [appsLoading, setAppsLoading] = useState(false)
  const [appsError, setAppsError] = useState(null)

  const [stage, setStage] = useState('')
  const [selectedAppId, setSelectedAppId] = useState('')

  const selectedApp = useMemo(
    () => apps.find((a) => String(a._id) === String(selectedAppId)) || null,
    [apps, selectedAppId]
  )

  const [tasksLoading, setTasksLoading] = useState(false)
  const [tasksError, setTasksError] = useState(null)
  const [tasksRes, setTasksRes] = useState(null)

  const [createTaskForm, setCreateTaskForm] = useState({
    title: '',
    description: '',
    dueDate: ''
  })
  const [creatingTask, setCreatingTask] = useState(false)

  const loadApps = async () => {
    setAppsLoading(true)
    setAppsError(null)
    try {
      const data = await fetchAllApplicationsForHR({ stage })
      setApps(data?.items || [])
      if (!selectedAppId && (data?.items?.[0]?._id || data?.items?.[0]?._id === null)) {
        setSelectedAppId(data.items[0]._id)
      }
    } catch (e) {
      setAppsError(e?.response?.data?.message || 'Không thể tải dữ liệu ứng viên.')
    } finally {
      setAppsLoading(false)
    }
  }

  const loadTasks = async (applicationId) => {
    setTasksLoading(true)
    setTasksError(null)
    try {
      const data = await fetchCandidateTasks({ applicationId })
      setTasksRes(data)
    } catch (e) {
      setTasksError(e?.response?.data?.message || 'Không thể tải nhiệm vụ của ứng viên.')
    } finally {
      setTasksLoading(false)
    }
  }

  const loadTasksRef = useRef(loadTasks)
  loadTasksRef.current = loadTasks

  useEffect(() => { void loadApps() }, [stage])
  useEffect(() => {
    if (!selectedApp?._id) return
    void loadTasks(selectedApp._id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAppId])

  const reloadTasksForSocket = useCallback(() => {
    const id = selectedApp?._id
    if (id) void loadTasksRef.current(id)
  }, [selectedApp?._id])

  useHrApplicationTasksSocket(selectedApp?._id, reloadTasksForSocket)

  const applicationsDistinctCandidates = useMemo(() => {
    const set = new Set(apps.map((a) => String(a.candidateId?._id || a.candidateId || '')))
    set.delete('')
    return set.size
  }, [apps])

  const stageCounts = useMemo(() => {
    const map = new Map()
    apps.forEach((a) => {
      const key = a.stage || '-'
      map.set(key, (map.get(key) || 0) + 1)
    })
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [apps])

  const genderCounts = useMemo(() => {
    const map = new Map()
    apps.forEach((a) => {
      const g = a.formData?.gender || '-'
      map.set(g, (map.get(g) || 0) + 1)
    })
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [apps])

  const handleCreateTask = async () => {
    if (!selectedApp?._id) return
    const candidateId = selectedApp.candidateId?._id
    if (!candidateId) return

    if (!createTaskForm.title.trim()) return

    setCreatingTask(true)
    setAppsError(null)
    try {
      await createCandidateTask({
        candidateId,
        applicationId: selectedApp._id,
        jobId: selectedApp.jobId?._id,
        title: createTaskForm.title.trim(),
        description: createTaskForm.description,
        dueDate: createTaskForm.dueDate ? new Date(createTaskForm.dueDate) : null
      })
      setCreateTaskForm({ title: '', description: '', dueDate: '' })
      await loadTasks(selectedApp._id)
    } catch (e) {
      setTasksError(e?.response?.data?.message || 'Không thể tạo task.')
    } finally {
      setCreatingTask(false)
    }
  }

  const handleUpdateTaskStatus = async (taskId, nextStatus) => {
    try {
      await updateCandidateTask(taskId, { status: nextStatus })
      await loadTasks(selectedApp._id)
    } catch (e) {
      setTasksError(e?.response?.data?.message || 'Không thể cập nhật task.')
    }
  }

  const handleDeleteTask = async (taskId) => {
    const ok = window.confirm('Bạn chắc chắn muốn xóa task này?')
    if (!ok) return
    try {
      await deleteCandidateTask(taskId)
      await loadTasks(selectedApp._id)
    } catch (e) {
      setTasksError(e?.response?.data?.message || 'Không thể xóa task.')
    }
  }

  return (
    <DashboardShell title="Quản lý bổ sung" navItems={dashboardNavItems}>
      <div className="hr-candidate-dash-topbar ui-page-enter">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              className="career-filter"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              style={{ background: 'var(--bg-white)', color: 'var(--text-primary)', height: 36 }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="Mới">Mới</option>
              <option value="Đang xét duyệt">Đang xét duyệt</option>
              <option value="Phỏng vấn">Phỏng vấn</option>
              <option value="Đề xuất">Đề xuất</option>
              <option value="Đã tuyển">Đã tuyển</option>
              <option value="Không phù hợp">Không phù hợp</option>
            </select>
          </div>
      </div>

      <div className="hr-candidate-dash-grid">
        <main className="hr-candidate-dash-main" style={{ gridColumn: '1 / -1' }}>
          {/* Metrics */}
            <section className="hr-candidate-metrics">
              <div className="hr-metric-card">
                <div className="hr-metric-title">Tổng ứng viên</div>
                <div className="hr-metric-value">{applicationsDistinctCandidates}</div>
              </div>
              <div className="hr-metric-card">
                <div className="hr-metric-title">Tổng hồ sơ</div>
                <div className="hr-metric-value">{apps.length}</div>
              </div>
              <div className="hr-metric-card">
                <div className="hr-metric-title">Giới tính (top)</div>
                <div className="hr-metric-value">
                  {genderCounts[0] ? `${genderLabel(genderCounts[0][0])}` : '-'}
                </div>
              </div>
              <div className="hr-metric-card">
                <div className="hr-metric-title">Trạng thái (top)</div>
                <div className="hr-metric-value">
                  {stageCounts[0] ? `${stageLabel(stageCounts[0][0])}` : '-'}
                </div>
              </div>
            </section>

            <section className="hr-candidate-content-grid">
              {/* Applicant list */}
              <div className="hr-candidate-list">
                <div className="hr-candidate-panel-title">Danh sách hồ sơ</div>
                {appsLoading && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <SkeletonCard rows={1} />
                    <SkeletonCard rows={1} />
                    <SkeletonCard rows={1} />
                  </div>
                )}
                {appsError && <p className="error-text">{appsError}</p>}
                {!appsLoading && !appsError && apps.length === 0 && (
                  <EmptyState icon="🧾" title="Chưa có dữ liệu." description="Không có hồ sơ phù hợp với bộ lọc hiện tại." />
                )}

                {!appsLoading && !appsError && apps.length > 0 && (
                  <div className="hr-app-table">
                    <div className="hr-app-table-head">
                      <div>Ứng viên</div>
                      <div>Vị trí</div>
                      <div>Trạng thái</div>
                    </div>
                    {apps.map((a) => (
                      <button
                        key={a._id}
                        type="button"
                        className={`hr-app-row ${String(selectedAppId) === String(a._id) ? 'hr-app-row--active' : ''}`}
                        onClick={() => setSelectedAppId(a._id)}
                      >
                        <div>
                          <div className="hr-app-name">{a.formData?.fullName || a.candidateId?.fullName || '—'}</div>
                          <div className="hr-app-email">{a.candidateId?.email || ''}</div>
                          <div className="hr-app-sub">{a.formData?.city || '-'} · {genderLabel(a.formData?.gender)}</div>
                        </div>
                        <div className="hr-app-sub">{a.jobId?.title || '-'}<br />{a.jobId?.jobCode || ''}</div>
                        <div className="hr-app-stage">{a.stage}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Candidate detail / CRUD */}
              <div className="hr-candidate-detail">
                <div className="hr-candidate-panel-title">Quản lý task</div>

                {!selectedApp && <p className="candidate-muted" style={{ padding: 0 }}>Chọn 1 hồ sơ ở bên trái.</p>}

                {selectedApp && (
                  <>
                    <div className="hr-candidate-detail-hero">
                      <div className="hr-candidate-detail-title">
                        {selectedApp.formData?.fullName || selectedApp.candidateId?.fullName || '—'}
                      </div>
                      <div className="hr-candidate-detail-sub">
                        {selectedApp.jobId?.title || '-'} · {selectedApp.jobId?.location || '-'} · {selectedApp.stage}
                      </div>
                    </div>

                    <div className="hr-candidate-task-form">
                      <div className="hr-form-label">Tạo task mới</div>
                      <div className="hr-task-form-grid">
                        <label className="job-form-field job-form-field--full">
                          <span>
                            Tiêu đề <span className="required">*</span>
                          </span>
                          <input
                            type="text"
                            value={createTaskForm.title}
                            onChange={(e) => setCreateTaskForm((p) => ({ ...p, title: e.target.value }))}
                            placeholder="Ví dụ: Nộp chứng chỉ liên quan"
                          />
                        </label>
                        <label className="job-form-field job-form-field--full">
                          <span>Mô tả</span>
                          <input
                            type="text"
                            value={createTaskForm.description}
                            onChange={(e) => setCreateTaskForm((p) => ({ ...p, description: e.target.value }))}
                            placeholder="Ví dụ: Chứng chỉ IT/An ninh mạng"
                          />
                        </label>
                        <label className="job-form-field">
                          <span>Hạn (tùy chọn)</span>
                          <input
                            type="date"
                            value={createTaskForm.dueDate}
                            onChange={(e) => setCreateTaskForm((p) => ({ ...p, dueDate: e.target.value }))}
                          />
                        </label>
                        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                          <button
                            type="button"
                            className="btn btn-primary"
                            disabled={creatingTask || !createTaskForm.title.trim()}
                            onClick={handleCreateTask}
                          >
                            {creatingTask ? 'Đang tạo...' : 'Tạo task'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {tasksLoading && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <SkeletonCard rows={1} />
                        <SkeletonCard rows={1} />
                      </div>
                    )}
                    {tasksError && <p className="error-text">{tasksError}</p>}

                    {!tasksLoading && !tasksError && tasksRes?.items?.length === 0 && (
                      <p className="candidate-muted" style={{ padding: 0, marginTop: 10 }}>Chưa có task nào.</p>
                    )}

                    {!tasksLoading && !tasksError && tasksRes?.items?.length > 0 && (
                      <div className="hr-task-list">
                        {tasksRes.items.map((t) => (
                          <div key={t._id} className="hr-task-row">
                            <div className="hr-task-main">
                              <div className="hr-task-title">{t.title}</div>
                              <div className="hr-task-sub">
                                {t.dueDate ? `Hạn: ${new Date(t.dueDate).toLocaleDateString('vi-VN')}` : 'Hạn: -'} · {t.status}
                              </div>
                              {t.description ? <div className="hr-task-desc">{t.description}</div> : null}

                              <div className="hr-task-docs">
                                <div className="hr-task-docs-title">Tài liệu đã nộp</div>
                                {Array.isArray(t.documents) && t.documents.length > 0 ? (
                                  <div className="hr-task-docs-list">
                                    {t.documents.map((d) => (
                                      <a key={d._id || d.storedPath} className="hr-task-doc-link" href={d.url} target="_blank" rel="noreferrer">
                                        {docTypeLabel(d.docType)}
                                      </a>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="candidate-muted" style={{ padding: 0 }}>Chưa có tài liệu.</div>
                                )}
                              </div>
                            </div>

                            <div className="hr-task-actions">
                              <select
                                className="career-filter"
                                value={t.status}
                                onChange={(e) => void handleUpdateTaskStatus(t._id, e.target.value)}
                                style={{ background: 'var(--bg-white)', color: 'var(--text-primary)', height: 36 }}
                              >
                                <option value="pending">pending</option>
                                <option value="in_progress">in_progress</option>
                                <option value="submitted">submitted</option>
                                <option value="approved">approved</option>
                                <option value="rejected">rejected</option>
                                <option value="completed">completed</option>
                              </select>
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => void handleDeleteTask(t._id)}
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          </main>
      </div>
    </DashboardShell>
  )
}

