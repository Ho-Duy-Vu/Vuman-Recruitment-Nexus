import { useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  closeJob,
  createJob,
  deleteJob,
  fetchAllJobs,
  publishJob,
  updateJob
} from '../../api/job.api'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { useHrDashboardNavItems } from '../../hooks/useHrDashboardNavItems'
import { selectCurrentUser } from '../../store/authSlice'

const DEFAULT_FORM = {
  title: '',
  department: '',
  location: '',
  workMode: 'onsite',
  employmentType: 'full_time',
  description: '',
  requiredSkills: '',
  expiresAt: ''
}

/** ISO → giá trị cho input datetime-local (local) */
const toDatetimeLocalValue = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const normalizeSkills = (text) =>
  String(text || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

const statusLabel = (s) => {
  if (s === 'draft') return 'Bản nháp'
  if (s === 'open') return 'Đang tuyển'
  if (s === 'closed') return 'Đã đóng'
  return s || '-'
}

export function JobManagementPage() {
  const user = useSelector(selectCurrentUser)

  const isAdmin = user?.role === 'admin'
  const dashboardNavItems = useHrDashboardNavItems(isAdmin)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)

  const [filters, setFilters] = useState({
    status: '',
    department: '',
    employmentType: '',
    location: '',
    workMode: ''
  })

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)

  /** Bài A: gõ bộ phận không bắn API từng ký tự (debounce 280ms) + deferred cho query ổn định */
  const debouncedDepartment = useDebouncedValue(filters.department, 280)
  const deferredDepartment = useDeferredValue(debouncedDepartment)

  const query = useMemo(
    () => ({
      status: filters.status,
      department: deferredDepartment,
      employmentType: filters.employmentType,
      location: filters.location,
      workMode: filters.workMode,
      page,
      limit
    }),
    [
      filters.status,
      deferredDepartment,
      filters.employmentType,
      filters.location,
      filters.workMode,
      page,
      limit
    ]
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAllJobs(query)
      setItems(data.items || [])
      setTotal(Number(data.total || 0))
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể tải danh sách công việc.')
    } finally {
      setLoading(false)
    }
  }, [query])

  useEffect(() => {
    void load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    setForm(DEFAULT_FORM)
    setDrawerOpen(true)
  }

  const openEdit = (job) => {
    setEditing(job)
    setForm({
      title: job.title || '',
      department: job.department || '',
      location: job.location || '',
      workMode: job.workMode || 'onsite',
      employmentType: job.employmentType || 'full_time',
      description: job.description || '',
      requiredSkills: (job.requiredSkills || []).join(', '),
      expiresAt: toDatetimeLocalValue(job.expiresAt)
    })
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditing(null)
    setForm(DEFAULT_FORM)
  }

  const submitForm = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const expiresIso = form.expiresAt ? new Date(form.expiresAt).toISOString() : null
      const payload = {
        title: form.title.trim(),
        department: form.department.trim(),
        location: form.location.trim(),
        workMode: form.workMode,
        employmentType: form.employmentType,
        description: form.description,
        requiredSkills: normalizeSkills(form.requiredSkills)
      }
      if (expiresIso) payload.expiresAt = expiresIso
      else if (editing?._id) payload.expiresAt = null

      if (editing?._id) {
        await updateJob(editing._id, payload)
      } else {
        await createJob(payload)
      }

      closeDrawer()
      await load()
    } catch (e2) {
      const msg =
        e2?.response?.data?.message ||
        (e2?.response?.data?.errors?.[0]?.message ?? 'Không thể lưu công việc.')
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const doPublish = async (jobId) => {
    setError(null)
    try {
      await publishJob(jobId)
      await load()
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể mở tuyển.')
    }
  }

  const doClose = async (jobId) => {
    setError(null)
    try {
      await closeJob(jobId)
      await load()
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể đóng tuyển.')
    }
  }

  const doDelete = async (jobId) => {
    if (!isAdmin) return
    // eslint-disable-next-line no-alert
    const ok = window.confirm('Bạn chắc chắn muốn xóa công việc này?')
    if (!ok) return
    setError(null)
    try {
      await deleteJob(jobId)
      await load()
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể xóa công việc.')
    }
  }

  const pageCount = Math.max(1, Math.ceil(total / limit))

  return (
    <DashboardShell title="Quản lý công việc" navItems={dashboardNavItems}>
      <section className="career-detail-card admin-card">
        <div className="candidate-apps-header">
          <h2 className="candidate-section-title">Danh sách công việc</h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              className="career-filter"
              value={filters.status}
              onChange={(e) => {
                setPage(1)
                setFilters((p) => ({ ...p, status: e.target.value }))
              }}
              style={{ background: 'var(--bg-white)', color: 'var(--text-primary)' }}
            >
              <option value="">Trạng thái</option>
              <option value="draft">Bản nháp</option>
              <option value="open">Đang tuyển</option>
              <option value="closed">Đã đóng</option>
            </select>
            <input
              className="career-search-input"
              value={filters.department}
              onChange={(e) => {
                setPage(1)
                setFilters((p) => ({ ...p, department: e.target.value }))
              }}
              placeholder="Lọc theo bộ phận (ví dụ: Engineering)"
              style={{ maxWidth: 340, background: 'var(--bg-white)', color: 'var(--text-primary)' }}
            />
            <select
              className="career-filter"
              value={filters.employmentType}
              onChange={(e) => {
                setPage(1)
                setFilters((p) => ({ ...p, employmentType: e.target.value }))
              }}
              style={{ background: 'var(--bg-white)', color: 'var(--text-primary)' }}
            >
              <option value="">Loại hình</option>
              <option value="part_time">part time</option>
              <option value="full_time">fulltime</option>
            </select>
            <select
              className="career-filter"
              value={filters.location}
              onChange={(e) => {
                setPage(1)
                setFilters((p) => ({ ...p, location: e.target.value }))
              }}
              style={{ background: 'var(--bg-white)', color: 'var(--text-primary)' }}
            >
              <option value="">Địa điểm</option>
              <option value="TP. Hồ Chí Minh">HCM</option>
              <option value="Hà Nội">HA NÔI</option>
              <option value="Đà Nẵng">DA NANG</option>
              <option value="US">US</option>
              <option value="Hong Kong">HONGKONG</option>
              <option value="Singapore">SINGAPO</option>
              <option value="Malaysia">MALAY</option>
            </select>
            <select
              className="career-filter"
              value={filters.workMode}
              onChange={(e) => {
                setPage(1)
                setFilters((p) => ({ ...p, workMode: e.target.value }))
              }}
              style={{ background: 'var(--bg-white)', color: 'var(--text-primary)' }}
            >
              <option value="">Thêm ▾</option>
              <option value="onsite">onsite</option>
              <option value="hybrid">hybrid</option>
              <option value="remote">remote</option>
            </select>
            <button type="button" className="btn btn-secondary" onClick={() => void load()} disabled={loading}>
              {loading ? 'Đang tải...' : 'Làm mới'}
            </button>
            <button type="button" className="btn btn-primary" onClick={openCreate}>
              Tạo công việc
            </button>
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="admin-hr-list">
          {items.map((j) => {
            const exp = j.expiresAt ? new Date(j.expiresAt) : null
            const isExpiredOpen =
              j.status === 'open' && exp && !Number.isNaN(exp.getTime()) && exp.getTime() < Date.now()
            return (
            <div key={j._id} className="admin-hr-row">
              <div className="admin-hr-main">
                <div className="admin-hr-name">
                  {j.title}{' '}
                  <span style={{ fontSize: 12, fontWeight: 700, color: j.status === 'open' ? '#0d6e56' : '#767676' }}>
                    ({statusLabel(j.status)})
                  </span>
                  {isExpiredOpen && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#b45309',
                        background: '#fef3c7',
                        padding: '2px 8px',
                        borderRadius: 99
                      }}
                    >
                      Quá hạn (chờ cron đóng)
                    </span>
                  )}
                </div>
                <div className="admin-hr-meta">
                  Mã: {j.jobCode || j._id}
                  {' · '}
                  Bộ phận: {j.department || '-'}
                  {' · '}
                  Địa điểm: {j.location || '-'}
                  {' · '}
                  Làm việc: {j.workMode || '-'}
                  {' · '}
                  Thời gian: {j.employmentType || '-'}
                  {j.expiresAt ? (
                    <>
                      {' · '}
                      Hết hạn: {new Date(j.expiresAt).toLocaleString('vi-VN')}
                    </>
                  ) : null}
                </div>
              </div>

              <div className="admin-hr-actions">
                <button type="button" className="btn btn-secondary" onClick={() => openEdit(j)}>
                  Sửa
                </button>
                {j.status !== 'open' ? (
                  <button type="button" className="btn btn-primary" onClick={() => void doPublish(j._id)}>
                    Mở tuyển
                  </button>
                ) : (
                  <button type="button" className="btn btn-secondary" onClick={() => void doClose(j._id)}>
                    Đóng tuyển
                  </button>
                )}
                {isAdmin && (
                  <button type="button" className="btn btn-secondary" onClick={() => void doDelete(j._id)}>
                    Xóa
                  </button>
                )}
              </div>
            </div>
            )
          })}
          {!loading && items.length === 0 && <p className="candidate-muted">Chưa có công việc.</p>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#767676' }}>
            Tổng: <strong style={{ color: 'var(--text-primary)' }}>{total}</strong>
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Trang trước
            </button>
            <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>
              {page} / {pageCount}
            </span>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page >= pageCount}
            >
              Trang sau
            </button>
          </div>
        </div>
      </section>

      {drawerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDrawer()
          }}
        >
          <div
            className="modal-card"
            style={{ width: 'min(720px, 96vw)' }}
          >
            <div className="job-form-header">
              <div>
                <h2 className="modal-title" style={{ marginBottom: 6 }}>
                  {editing ? 'Cập nhật công việc' : 'Tạo công việc'}
                </h2>
                <p className="job-form-subtitle">
                  Các trường có dấu <span className="required">*</span> là bắt buộc.
                </p>
              </div>
              <button type="button" className="btn btn-secondary" onClick={closeDrawer}>
                Đóng
              </button>
            </div>

            {error && <p className="error-text" style={{ marginBottom: 12 }}>{error}</p>}

            <form onSubmit={submitForm} className="job-form">
              <div className="job-form-grid">
                <label className="job-form-field job-form-field--full">
                  <span>
                    Tên công việc <span className="required">*</span>
                  </span>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Ví dụ: Kỹ sư Backend (Node.js)"
                    required
                  />
                </label>

                <label className="job-form-field">
                  <span>Mã công việc</span>
                  <input
                    type="text"
                    value={editing?.jobCode || 'Tự động tạo khi lưu'}
                    readOnly
                    aria-label="Mã công việc"
                  />
                </label>

                <label className="job-form-field">
                  <span>
                    Bộ phận <span className="required">*</span>
                  </span>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                    placeholder="Ví dụ: Công nghệ thông tin"
                    required
                  />
                </label>

                <label className="job-form-field">
                  <span>
                    Địa điểm <span className="required">*</span>
                  </span>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    placeholder="Ví dụ: TP. Hồ Chí Minh"
                    required
                  />
                </label>

                <label className="job-form-field">
                  <span>
                    Loại hình làm việc <span className="required">*</span>
                  </span>
                  <select
                    value={form.workMode}
                    onChange={(e) => setForm((p) => ({ ...p, workMode: e.target.value }))}
                    required
                  >
                    <option value="onsite">Onsite</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="remote">Remote</option>
                  </select>
                </label>

                <label className="job-form-field">
                  <span>
                    Thời gian <span className="required">*</span>
                  </span>
                  <select
                    value={form.employmentType}
                    onChange={(e) => setForm((p) => ({ ...p, employmentType: e.target.value }))}
                    required
                  >
                    <option value="full_time">Full time</option>
                    <option value="part_time">Part time</option>
                  </select>
                </label>

                <label className="job-form-field job-form-field--full">
                  <span>Kỹ năng yêu cầu (phân tách bằng dấu phẩy)</span>
                  <input
                    type="text"
                    value={form.requiredSkills}
                    onChange={(e) => setForm((p) => ({ ...p, requiredSkills: e.target.value }))}
                    placeholder="Ví dụ: React, Node.js, MongoDB"
                  />
                </label>

                <label className="job-form-field job-form-field--full">
                  <span>
                    Mô tả <span className="required">*</span>
                  </span>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Mô tả công việc, trách nhiệm chính, yêu cầu..."
                    required
                    rows={7}
                  />
                </label>

                <label className="job-form-field job-form-field--full">
                  <span>Ngày hết hạn tuyển (tùy chọn)</span>
                  <input
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))}
                  />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                    Để trống = không giới hạn. Quá hạn: job đang mở sẽ được cron đóng mỗi giờ.
                  </span>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeDrawer} disabled={saving}>
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}

