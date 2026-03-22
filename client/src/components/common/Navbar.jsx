import { useDispatch, useSelector } from 'react-redux'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { logout, selectCurrentUser } from '../../store/authSlice'
import { logoutApi } from '../../api/auth.api'
import { useTheme } from '../../hooks/useTheme'
import { useI18n } from '../../contexts/I18nContext'
import { useEffect, useRef, useState } from 'react'

import { CandidateNotificationBell } from '../candidate/CandidateNotificationBell'
import { useCandidateInbox } from '../../contexts/CandidateInboxContext'

export function Navbar() {
  const candidateInbox = useCandidateInbox()
  const user = useSelector(selectCurrentUser)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { theme, toggleTheme } = useTheme()
  const { t } = useI18n()
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef(null)

  useEffect(() => {
    if (!accountMenuOpen) return

    const onDocMouseDown = (e) => {
      if (!accountMenuRef.current) return
      const target = e.target
      if (target && !accountMenuRef.current.contains(target)) {
        setAccountMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [accountMenuOpen])

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
          {t('navbar.about')}
        </NavLink>
        <NavLink to="/jobs" className="navbar-link">
          {t('navbar.jobs')}
        </NavLink>

        {user?.role === 'candidate' && (
          <NavLink to="/candidate" className="navbar-link">
            {t('navbar.candidate')}
          </NavLink>
        )}

        {(user?.role === 'hr' || user?.role === 'admin') && (
          <>
            <NavLink to="/hr/kanban" className="navbar-link">
              {t('navbar.kanban')}
            </NavLink>
            <NavLink to="/hr/candidates" className="navbar-link">
              {t('navbar.manageWork')}
            </NavLink>
          </>
        )}

        <span className="navbar-divider" />

        {user?.role === 'candidate' && (
          <div style={{ display: 'flex', alignItems: 'center', marginRight: 4 }}>
            <CandidateNotificationBell
              notifications={candidateInbox.notifications}
              onMarkAllRead={candidateInbox.markAllRead}
            />
          </div>
        )}

        <button
          type="button"
          className="navbar-theme-toggle"
          onClick={toggleTheme}
          aria-label="Chuyển chế độ giao diện"
          title={theme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
        >
          {theme === 'dark' ? t('theme.light') : t('theme.dark')}
        </button>

        {user?.email ? (
          <div className="navbar-user-area">
            <button
              type="button"
              className="navbar-user-email"
              onClick={() => setAccountMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={accountMenuOpen}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle', marginRight: 4 }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              {user.email}
            </button>

            {accountMenuOpen && (
              <div ref={accountMenuRef} className="navbar-account-menu" role="menu" aria-label="Tài khoản">
                <NavLink
                  to="/profile"
                  className="navbar-account-menu-item"
                  onClick={() => setAccountMenuOpen(false)}
                >
                  {t('menu.profile')}
                </NavLink>
                <NavLink
                  to="/settings"
                  className="navbar-account-menu-item"
                  onClick={() => setAccountMenuOpen(false)}
                >
                  {t('menu.settings')}
                </NavLink>
                <NavLink
                  to="/change-password"
                  className="navbar-account-menu-item"
                  onClick={() => setAccountMenuOpen(false)}
                >
                  {t('menu.changePassword')}
                </NavLink>
                <NavLink
                  to="/help"
                  className="navbar-account-menu-item"
                  onClick={() => setAccountMenuOpen(false)}
                >
                  {t('menu.help')}
                </NavLink>
              </div>
            )}
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
