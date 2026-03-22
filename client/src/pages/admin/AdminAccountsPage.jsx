import { useEffect, useMemo, useState } from 'react'

import {
  createCandidate,
  createHR,
  deleteCandidate,
  deleteHR,
  fetchAllUsers,
  fetchHRList,
  updateCandidate,
  updateHR
} from '../../api/admin.api'
import { DashboardShell } from '../../components/dashboard/DashboardShell'
import { HR_DASH_NAV_FULL } from '../../constants/hrDashboardNav'

export function AdminAccountsPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [hrUsers, setHrUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [accountListRole, setAccountListRole] = useState('all')
  const [createAccountRole, setCreateAccountRole] = useState('hr')

  const [form, setForm] = useState({
    email: '',
    fullName: '',
    department: '',
    password: ''
  })

  const [candidateForm, setCandidateForm] = useState({
    email: '',
    fullName: '',
    phone: '',
    password: ''
  })

  const visibleAccounts =
    accountListRole === 'all' ? allUsers : allUsers.filter((u) => u.role === accountListRole)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [users, hrList] = await Promise.all([fetchAllUsers(), fetchHRList()])
      setAllUsers(users || [])
      setHrUsers(hrList || [])
    } catch (e) {
      setError('Không thể tải danh sách tài khoản.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const created = await createHR(form)
      setHrUsers((p) => [created.user, ...p].filter(Boolean))
      setForm({ email: '', fullName: '', department: '', password: '' })
      // Keep all-users list in sync
      const [users, hrList] = await Promise.all([fetchAllUsers(), fetchHRList()])
      setAllUsers(users || [])
      setHrUsers(hrList || [])
    } catch (e2) {
      setError(e2?.response?.data?.message || 'Tạo HR thất bại.')
    }
  }

  const handleSoftDelete = async (id) => {
    setError(null)
    try {
      await deleteHR(id)
      await load()
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể xóa HR.')
    }
  }

  const handleToggleActive = async (id, isActive) => {
    setError(null)
    try {
      await updateHR(id, { isActive })
      await load()
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể cập nhật trạng thái.')
    }
  }

  const candidateUsers = allUsers.filter((u) => u.role === 'candidate')

  const handleCreateCandidate = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      await createCandidate(candidateForm)
      setCandidateForm({ email: '', fullName: '', phone: '', password: '' })
      await load()
    } catch (e2) {
      setError(e2?.response?.data?.message || 'Tạo candidate thất bại.')
    }
  }

  const handleToggleCandidateActive = async (id, isActive) => {
    setError(null)
    try {
      await updateCandidate(id, { isActive })
      await load()
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể cập nhật trạng thái candidate.')
    }
  }

  const handleDeleteCandidate = async (id) => {
    setError(null)
    try {
      await deleteCandidate(id)
      await load()
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể xóa candidate.')
    }
  }

  const handleEditCandidate = async (id, currentFullName, currentPhone) => {
    const nextFullName = window.prompt('Nhập Họ và tên mới:', currentFullName || '')
    if (nextFullName === null) return
    const trimmedFullName = String(nextFullName).trim()
    if (!trimmedFullName) {
      setError('Họ và tên không được rỗng.')
      return
    }

    const nextPhone = window.prompt('Nhập Số điện thoại (tùy chọn):', currentPhone || '')
    if (nextPhone === null) return
    const trimmedPhone = String(nextPhone).trim()

    setError(null)
    try {
      await updateCandidate(id, { fullName: trimmedFullName, phone: trimmedPhone || undefined })
      await load()
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể cập nhật candidate.')
    }
  }

  return (
    <DashboardShell title="Quản lý tài khoản" navItems={HR_DASH_NAV_FULL}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        <button
          type="button"
          className={`btn ${createAccountRole === 'hr' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setCreateAccountRole('hr')
            setAccountListRole('hr')
          }}
        >
          HR
        </button>
        <button
          type="button"
          className={`btn ${createAccountRole === 'candidate' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setCreateAccountRole('candidate')
            setAccountListRole('candidate')
          }}
        >
          Candidate
        </button>
        <button
          type="button"
          className={`btn ${createAccountRole === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => {
            setCreateAccountRole('admin')
            setAccountListRole('admin')
          }}
        >
          Admin
        </button>
      </div>

      <section className="career-detail-card admin-card">
        <h2 className="candidate-section-title">Tạo tài khoản</h2>

        {createAccountRole === 'admin' && (
          <div className="candidate-muted" style={{ paddingTop: 8 }}>
            Chưa hỗ trợ tạo/CRUD tài khoản admin ở bản hiện tại.
          </div>
        )}

        {createAccountRole === 'hr' && (
          <form onSubmit={handleCreate} className="admin-form">
            <div className="admin-hr-form-grid">
              <label className="login-field">
                Email <span className="required"></span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </label>

              <label className="login-field">
                Họ và tên <span className="required"></span>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  required
                />
              </label>

              <label className="login-field">
                Bộ phận <span className="required"></span>
                <input
                  type="text"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  required
                />
              </label>

              <label className="login-field">
                Password <span className="required"></span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </label>
            </div>

            <div className="admin-hr-form-actions">
              <button type="submit" className="btn btn-primary" disabled={loading || !form.password}>
                {loading ? 'Đang tạo...' : 'Tạo HR'}
              </button>
              <div className="admin-hr-form-hint">Mật khẩu tối thiểu 6 ký tự.</div>
            </div>
          </form>
        )}

        {createAccountRole === 'candidate' && (
          <form onSubmit={handleCreateCandidate} className="admin-form">
            <div className="admin-hr-form-grid">
              <label className="login-field">
                Email <span className="required"></span>
                <input
                  type="email"
                  value={candidateForm.email}
                  onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                  required
                />
              </label>

              <label className="login-field">
                Họ và tên <span className="required"></span>
                <input
                  type="text"
                  value={candidateForm.fullName}
                  onChange={(e) => setCandidateForm({ ...candidateForm, fullName: e.target.value })}
                  required
                />
              </label>

              <label className="login-field">
                Số điện thoại (tùy chọn)
                <input
                  type="text"
                  value={candidateForm.phone}
                  onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                />
              </label>

              <label className="login-field">
                Password <span className="required"></span>
                <input
                  type="password"
                  value={candidateForm.password}
                  onChange={(e) => setCandidateForm({ ...candidateForm, password: e.target.value })}
                  required
                />
              </label>
            </div>

            <div className="admin-hr-form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !candidateForm.password}
              >
                {loading ? 'Đang tạo...' : 'Tạo Candidate'}
              </button>
              <div className="admin-hr-form-hint">Mật khẩu tối thiểu 6 ký tự.</div>
            </div>
          </form>
        )}

        {error && <p className="error-text">{error}</p>}
      </section>

      <section className="career-detail-card admin-card">
        <div className="candidate-apps-header">
          <h2 className="candidate-section-title">Danh sách tài khoản</h2>
          <button type="button" className="btn btn-secondary" onClick={() => void load()} disabled={loading}>
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <button
            type="button"
            className={`btn ${accountListRole === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setAccountListRole('all')}
          >
            Tất cả
          </button>
          <button
            type="button"
            className={`btn ${accountListRole === 'hr' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setAccountListRole('hr')}
          >
            HR
          </button>
          <button
            type="button"
            className={`btn ${accountListRole === 'candidate' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setAccountListRole('candidate')}
          >
            Candidate
          </button>
          <button
            type="button"
            className={`btn ${accountListRole === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setAccountListRole('admin')}
          >
            Admin
          </button>
        </div>

        <div className="admin-hr-list">
          {visibleAccounts.map((u) => (
            <div key={u._id} className="admin-hr-row">
              <div className="admin-hr-main">
                <div className="admin-hr-name">{u.fullName || u.email}</div>
                <div className="admin-hr-meta">
                  Email: {u.email}
                  {' · '}
                  Vai trò: {u.role}
                  {' · '}
                  Trạng thái: {u.isActive ? 'Đang hoạt động' : 'Đã vô hiệu'}
                  {u.department ? ` · Bộ phận: ${u.department}` : ''}
                  {u.phone ? ` · SĐT: ${u.phone}` : ''}
                  {u.role === 'candidate' ? ' · Lịch sử ứng tuyển: (sẽ có sau)' : ''}
                </div>
              </div>
            </div>
          ))}
          {visibleAccounts.length === 0 && <p className="candidate-muted">Chưa có user phù hợp.</p>}
        </div>
      </section>

      <section
        className="career-detail-card admin-card"
        style={{ display: accountListRole === 'all' || accountListRole === 'hr' ? 'block' : 'none' }}
      >
        <div className="candidate-apps-header">
          <h2 className="candidate-section-title">CRUD tài khoản HR</h2>
          <button type="button" className="btn btn-secondary" onClick={() => void load()} disabled={loading}>
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>

        <div className="admin-hr-list">
          {hrUsers.map((u) => (
            <div key={u._id} className="admin-hr-row">
              <div className="admin-hr-main">
                <div className="admin-hr-name">{u.fullName || u.email}</div>
                <div className="admin-hr-meta">
                  {u.department ? `Bộ phận: ${u.department}` : 'Bộ phận: -'}
                  {' · '}
                  Trạng thái: {u.isActive ? 'Đang hoạt động' : 'Đã vô hiệu'}
                </div>
              </div>

              <div className="admin-hr-actions">
                <button type="button" className="btn btn-secondary" onClick={() => handleToggleActive(u._id, !u.isActive)}>
                  {u.isActive ? 'Tạm khóa' : 'Mở lại'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    // eslint-disable-next-line no-alert
                    const ok = window.confirm('Bạn chắc chắn muốn xóa tài khoản HR này?')
                    if (ok) void handleSoftDelete(u._id)
                  }}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
          {hrUsers.length === 0 && <p className="candidate-muted">Chưa có HR.</p>}
        </div>
      </section>

      <section
        className="career-detail-card admin-card"
        style={{ display: accountListRole === 'all' || accountListRole === 'candidate' ? 'block' : 'none' }}
      >
        <div className="candidate-apps-header">
          <h2 className="candidate-section-title">CRUD tài khoản Candidate</h2>
          <button type="button" className="btn btn-secondary" onClick={() => void load()} disabled={loading}>
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>

        <div className="admin-hr-list">
          {candidateUsers.map((u) => (
            <div key={u._id} className="admin-hr-row">
              <div className="admin-hr-main">
                <div className="admin-hr-name">{u.fullName || u.email}</div>
                <div className="admin-hr-meta">
                  Email: {u.email}
                  {u.phone ? ` · SĐT: ${u.phone}` : ''}
                  {' · '}
                  Trạng thái: {u.isActive ? 'Đang hoạt động' : 'Đã vô hiệu'}
                  {' · '}Lịch sử ứng tuyển: (sẽ có sau)
                </div>
              </div>

              <div className="admin-hr-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleToggleCandidateActive(u._id, !u.isActive)}
                >
                  {u.isActive ? 'Tạm khóa' : 'Mở lại'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleEditCandidate(u._id, u.fullName, u.phone)}
                >
                  Sửa
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    // eslint-disable-next-line no-alert
                    const ok = window.confirm('Bạn chắc chắn muốn xóa candidate này?')
                    if (ok) void handleDeleteCandidate(u._id)
                  }}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
          {candidateUsers.length === 0 && <p className="candidate-muted">Chưa có candidate.</p>}
        </div>
      </section>
    </DashboardShell>
  )
}

