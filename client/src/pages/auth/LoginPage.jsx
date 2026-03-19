import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../api/auth.api'
import { setCredentials } from '../../store/authSlice'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const data = await login({ email, password })
      dispatch(setCredentials({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken }))
      if (data.user?.role === 'hr' || data.user?.role === 'admin') navigate('/hr/kanban')
      else navigate('/jobs')
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập không thành công. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-hero">
        <div className="auth-hero-inner">
          <h1 className="auth-hero-title">Công nghệ xuất sắc,<br />tầm nhìn vượt trội™</h1>
        </div>
      </div>

      <div className="auth-main">
        <div className="login-card">
          <h2 className="login-title">Đăng nhập</h2>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <p className="error-text login-error">{error}</p>}

            <label className="login-field">
              Địa chỉ email <span className="required"></span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ung.vien@gmail.com"
                required
              />
            </label>

            <label className="login-field">
              Mật khẩu <span className="required">  </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                required
              />
            </label>

            <button type="submit" className="btn btn-primary login-submit" disabled={submitting}>
              {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Chưa có tài khoản?{' '}
              <Link to="/register" className="login-link">Tạo tài khoản</Link>
            </p>
            <Link to="/forgot-password" className="login-link">Quên mật khẩu?</Link>
          </div>

          <div className="login-social">
            <span className="login-social-label">Theo dõi chúng tôi</span>
            <div className="login-social-links">
              <span>YouTube</span>
              <span>LinkedIn</span>
              <span>Facebook</span>
              <span>Glassdoor</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
