import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createHR, deleteHR, fetchHRList, updateHR } from '../../api/admin.api'

export function AdminHrPage() {
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hrUsers, setHrUsers] = useState([])

  const [form, setForm] = useState({
    email: '',
    fullName: '',
    department: '',
    password: ''
  })

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const users = await fetchHRList()
      setHrUsers(users || [])
    } catch (e) {
      setError('Không thể tải danh sách HR.')
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

  return (
    <main className="admin-layout">
      <div className="admin-header">
        <button type="button" className="career-back-link" onClick={() => navigate('/jobs')}>
          ← Quay lại trang chủ
        </button>
        <h1 className="apply-title">Quản trị HR</h1>
        <p className="apply-section-description">
          Tạo mới tài khoản HR bằng email + password do admin cung cấp.
        </p>
      </div>

      <section className="career-detail-card admin-card">
        <h2 className="candidate-section-title">Tạo tài khoản HR</h2>

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

        {error && <p className="error-text">{error}</p>}
      </section>

      <section className="career-detail-card admin-card">
        <div className="candidate-apps-header">
          <h2 className="candidate-section-title">Danh sách HR</h2>
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
    </main>
  )
}

