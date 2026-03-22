import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import { fetchActiveSessions, revokeAllSessions, revokeSession } from '../api/session.api'
import { selectCurrentUser, selectIsAuthenticated } from '../store/authSlice'
import { DashboardShell } from '../components/dashboard/DashboardShell'
import { useHrDashboardNavItems } from '../hooks/useHrDashboardNavItems'

export function SessionManagementPage() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)
  const isAdmin = user?.role === 'admin'
  const dashboardNavItems = useHrDashboardNavItems(isAdmin)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sessions, setSessions] = useState([])

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await fetchActiveSessions()
      setSessions(list || [])
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể tải danh sách phiên.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const formatDate = (v) => {
    if (!v) return '-'
    const d = new Date(v)
    if (Number.isNaN(d.getTime())) return '-'
    return d.toLocaleString('vi-VN')
  }

  const handleRemoteLogout = async (sessionId) => {
    // eslint-disable-next-line no-alert
    const ok = window.confirm('Bạn chắc chắn muốn đăng xuất từ xa phiên này?')
    if (!ok) return
    setError(null)
    try {
      await revokeSession(sessionId)
      await load()
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể đăng xuất từ xa.')
    }
  }

  const handleLogoutAll = async () => {
    // eslint-disable-next-line no-alert
    const ok = window.confirm('Bạn chắc chắn muốn đăng xuất từ xa tất cả phiên?')
    if (!ok) return
    setError(null)
    try {
      await revokeAllSessions()
      // If current session is revoked, FE interceptor will logout on next API call.
      await load()
    } catch (e) {
      setError(e?.response?.data?.message || 'Không thể đăng xuất tất cả phiên.')
    }
  }

  return (
    <DashboardShell title="Quản lý phiên" navItems={dashboardNavItems}>
      <section className="career-detail-card admin-card">
        <div className="candidate-apps-header">
          <h2 className="candidate-section-title">Phiên đang hoạt động</h2>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary" onClick={() => void load()} disabled={loading}>
              {loading ? 'Đang tải...' : 'Làm mới'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => void handleLogoutAll()} disabled={loading}>
              Đăng xuất tất cả
            </button>
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}

        {loading && <p className="candidate-muted" style={{ padding: 0 }}>Đang tải...</p>}

        {!loading && !error && sessions.length === 0 && (
          <p className="candidate-muted" style={{ padding: 0 }}>
            Không có phiên đang hoạt động.
          </p>
        )}

        {!loading && !error && sessions.length > 0 && (
          <div className="session-table-wrap">
            <table className="candidate-table">
              <thead>
                <tr>
                  <th>Thiết bị</th>
                  <th>IP</th>
                  <th>Phiên</th>
                  <th>Last used</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s._id}>
                    <td>{s.userAgent ? s.userAgent.slice(0, 34) : '-'}</td>
                    <td>{s.ip || '-'}</td>
                    <td>{s._id}</td>
                    <td>{formatDate(s.lastUsedAt)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => void handleRemoteLogout(s._id)}
                      >
                        Đăng xuất từ xa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: 14, color: 'var(--text-muted)', fontSize: 13 }}>
          Đang đăng nhập: {user?.email || user?.fullName || '-'}
        </div>
      </section>
    </DashboardShell>
  )
}

