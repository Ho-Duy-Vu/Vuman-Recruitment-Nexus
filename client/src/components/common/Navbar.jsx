import { useDispatch, useSelector } from 'react-redux'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { logout, selectCurrentUser } from '../../store/authSlice'
import { logoutApi } from '../../api/auth.api'

export function Navbar() {
  const user = useSelector(selectCurrentUser)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleLogout = async () => {
    try {
      await logoutApi()
    } catch {
      // vẫn clear session FE nếu BE không phản hồi
    } finally {
      dispatch(logout())
      navigate('/login')
    }
  }

  return (
    <header className="navbar">
      <div className="navbar-left">
        <Link to="/jobs" className="navbar-brand">
          <div className="navbar-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <rect x="2" y="2" width="24" height="24" rx="4" fill="none" stroke="#0d6e56" strokeWidth="2.5"/>
              <text x="14" y="20" textAnchor="middle" fill="#0d6e56" fontSize="13" fontWeight="700" fontFamily="sans-serif">V</text>
            </svg>
          </div>
          <span className="navbar-brand-text">Vuman Careers</span>
        </Link>
      </div>

      <nav className="navbar-right">
        <NavLink to="/about" className="navbar-link">
          Cuộc sống tại Vuman
        </NavLink>
        <NavLink to="/jobs" className="navbar-link">
          Tìm việc làm
        </NavLink>

        {user?.role === 'candidate' && (
          <NavLink to="/candidate" className="navbar-link">
            Trang ứng viên
          </NavLink>
        )}

        {(user?.role === 'hr' || user?.role === 'admin') && (
          <>
            <NavLink to="/hr/kanban" className="navbar-link">
              Kanban
            </NavLink>
            <NavLink to="/hr/jobs" className="navbar-link">
              Quản lý công việc
            </NavLink>
          </>
        )}

        {user?.role === 'admin' && (
          <NavLink to="/admin/hr" className="navbar-link">
            Quản trị
          </NavLink>
        )}

        <span className="navbar-divider" />

        {user?.email ? (
          <div className="navbar-user-area">
            <span className="navbar-user-email">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 4 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              {user.email}
            </span>
            <button type="button" className="navbar-logout" onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        ) : (
          <button type="button" className="navbar-user" onClick={() => navigate('/login')}>
            <span className="navbar-login-placeholder">Đăng nhập</span>
          </button>
        )}
      </nav>
    </header>
  )
}
