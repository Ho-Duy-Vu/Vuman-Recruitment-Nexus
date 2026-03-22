import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { fetchAllApplicationsForHR } from '../../api/application.api'
import {
  createHrInterviewSchedule,
  deleteHrInterviewSchedule,
  fetchHrInterviewSchedules,
  updateHrInterviewSchedule
} from '../../api/interviewSchedule.api'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { useHrDashboardNavItems } from '../../hooks/useHrDashboardNavItems'
import { selectCurrentUser } from '../../store/authSlice'

const emptyForm = {
  applicationId: '',
  datetime: '',
  format: 'online',
  location: '',
  interviewerName: '',
  noteToCandidate: '',
  status: 'scheduled'
}

const statusLabel = (s) => {
  if (s === 'completed') return 'Hoàn thành'
  if (s === 'cancelled') return 'Đã hủy'
  return 'Đã lên lịch'
}

export function HrInterviewSchedulesPage() {
  const user = useSelector(selectCurrentUser)
  const isAdmin = user?.role === 'admin'
  const navItems = useHrDashboardNavItems(isAdmin)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)

  const [appChoices, setAppChoices] = useState([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchHrInterviewSchedules({ page, limit })
      setItems(data.items || [])
      setTotal(Number(data.total || 0))
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể tải lịch phỏng vấn.')
    } finally {
      setLoading(false)
    }
  }, [page, limit])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await fetchAllApplicationsForHR({ page: 1, limit: 100 })
        if (mounted) setAppChoices(data.items || [])
      } catch {
        if (mounted) setAppChoices([])
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setDrawerOpen(true)
  }

  const openEdit = (row) => {
    setEditingId(row._id)
    setForm({
      applicationId: String(row.applicationId),
      datetime: row.datetime ? toLocalInput(row.datetime) : '',
      format: row.format || 'online',
      location: row.location || '',
      interviewerName: row.interviewerName || '',
      noteToCandidate: row.noteToCandidate || '',
      status: row.status || 'scheduled'
    })
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.applicationId || !form.datetime) {
      setError('Chọn hồ sơ và thời gian.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const base = {
        datetime: new Date(form.datetime).toISOString(),
        format: form.format,
        location: form.location || null,
        interviewerName: form.interviewerName || null,
        noteToCandidate: form.noteToCandidate || null,
        status: form.status
      }
      if (editingId) {
        await updateHrInterviewSchedule(editingId, base)
      } else {
        await createHrInterviewSchedule({
          applicationId: form.applicationId,
          ...base
        })
      }
      closeDrawer()
      await load()
    } catch (e2) {
      setError(e2?.response?.data?.message || 'Không thể lưu.')
    } finally {
      setSaving(false)
    }
  }

  const doDelete = async (id) => {
    // eslint-disable-next-line no-alert
    const ok = window.confirm('Xóa lịch phỏng vấn này? Ứng viên sẽ nhận thông báo.')
    if (!ok) return
    setError(null)
    try {
      await deleteHrInterviewSchedule(id)
      await load()
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể xóa.')
    }
  }

  const pageCount = Math.max(1, Math.ceil(total / limit))

  return (
    <DashboardShell title="Quản lý lịch phỏng vấn" navItems={navItems}>
      <section className="career-detail-card admin-card ui-page-enter">
        <div className="candidate-apps-header">
          <h2 className="candidate-section-title">Tất cả lịch phỏng vấn (ứng viên)</h2>
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            + Thêm lịch
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}
        {loading && <p className="candidate-muted">Đang tải...</p>}

        {!loading && (
          <div style={{ overflowX: 'auto' }}>
            <table className="candidate-table" style={{ minWidth: 720 }}>
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Ứng viên</th>
                  <th>Vị trí (JD)</th>
                  <th>Hình thức</th>
                  <th>Trạng thái</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((row) => {
                  const app = row.application
                  const cand = app?.candidateId
                  const job = app?.jobId
                  const name = cand?.fullName || cand?.email || '—'
                  const jobTitle = job?.title || '—'
                  return (
                    <tr key={row._id}>
                      <td>
                        {row.datetime
                          ? new Date(row.datetime).toLocaleString('vi-VN', {
                              dateStyle: 'short',
                              timeStyle: 'short'
                            })
                          : '—'}
                      </td>
                      <td>{name}</td>
                      <td>{jobTitle}</td>
                      <td>{row.format === 'online' ? 'Online' : 'Tại chỗ'}</td>
                      <td>{statusLabel(row.status)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button type="button" className="btn btn-secondary" onClick={() => openEdit(row)}>
                            Sửa
                          </button>
                          <button type="button" className="btn btn-secondary" onClick={() => void doDelete(row._id)}>
                            Xóa
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

        {!loading && items.length === 0 && <p className="candidate-muted">Chưa có lịch nào. Thêm lịch hoặc kéo Kanban sang “Phỏng vấn”.</p>}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#767676' }}>
            Tổng: <strong>{total}</strong>
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              Trước
            </button>
            <span style={{ fontSize: 13 }}>
              {page} / {pageCount}
            </span>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page >= pageCount}
            >
              Sau
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
          <div className="modal-card" style={{ width: 'min(560px, 96vw)' }}>
            <div className="job-form-header">
              <h2 className="modal-title">{editingId ? 'Sửa lịch phỏng vấn' : 'Thêm lịch phỏng vấn'}</h2>
              <button type="button" className="btn btn-secondary" onClick={closeDrawer}>
                Đóng
              </button>
            </div>

            <form onSubmit={submit} className="job-form">
              <div className="job-form-grid">
                {!editingId && (
                  <label className="job-form-field job-form-field--full">
                    <span>
                      Hồ sơ ứng tuyển <span className="required">*</span>
                    </span>
                    <select
                      value={form.applicationId}
                      onChange={(e) => setForm((p) => ({ ...p, applicationId: e.target.value }))}
                      required
                      style={{ height: 40 }}
                    >
                      <option value="">— Chọn hồ sơ —</option>
                      {appChoices.map((a) => {
                        const c = a.candidateId
                        const j = a.jobId
                        const label = `${c?.fullName || c?.email || '?'} · ${j?.title || '?'} · ${a.stage || ''}`
                        return (
                          <option key={a._id} value={a._id}>
                            {label}
                          </option>
                        )
                      })}
                    </select>
                  </label>
                )}

                <label className="job-form-field job-form-field--full">
                  <span>
                    Thời gian <span className="required">*</span>
                  </span>
                  <input
                    type="datetime-local"
                    value={form.datetime}
                    onChange={(e) => setForm((p) => ({ ...p, datetime: e.target.value }))}
                    required
                  />
                </label>

                <label className="job-form-field">
                  <span>Hình thức</span>
                  <select value={form.format} onChange={(e) => setForm((p) => ({ ...p, format: e.target.value }))}>
                    <option value="online">Online</option>
                    <option value="offline">Tại chỗ</option>
                  </select>
                </label>

                <label className="job-form-field">
                  <span>Trạng thái lịch</span>
                  <select value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                    <option value="scheduled">Đã lên lịch</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </label>

                <label className="job-form-field job-form-field--full">
                  <span>{form.format === 'online' ? 'Link họp' : 'Địa điểm'}</span>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                    placeholder={form.format === 'online' ? 'https://...' : 'Địa chỉ'}
                  />
                </label>

                <label className="job-form-field job-form-field--full">
                  <span>Người phỏng vấn</span>
                  <input
                    type="text"
                    value={form.interviewerName}
                    onChange={(e) => setForm((p) => ({ ...p, interviewerName: e.target.value }))}
                  />
                </label>

                <label className="job-form-field job-form-field--full">
                  <span>Ghi chú cho ứng viên</span>
                  <textarea
                    rows={3}
                    value={form.noteToCandidate}
                    onChange={(e) => setForm((p) => ({ ...p, noteToCandidate: e.target.value }))}
                    maxLength={300}
                  />
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

function toLocalInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
