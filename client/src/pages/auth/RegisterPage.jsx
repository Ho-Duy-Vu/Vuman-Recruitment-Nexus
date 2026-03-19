import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerCandidate } from '../../api/auth.api'

export function RegisterPage() {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }

    setSubmitting(true)
    try {
      await registerCandidate({ email, password, fullName })
      navigate('/login')
    } catch (err) {
      const msg = err.response?.data?.message || 'Đăng ký không thành công. Vui lòng thử lại.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <div className="auth-hero-inner">
          <h1 className="auth-hero-title">Tạo tài khoản ứng viên</h1>
        </div>
      </section>

      <section className="auth-main">
        <div className="login-card">
          <h2 className="login-title">Đăng ký</h2>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <p className="error-text login-error">{error}</p>}

            <label className="login-field">
              Họ và tên <span className="required"></span>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                required
              />
            </label>

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
              Mật khẩu <span className="required"></span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                required
              />
            </label>

            <label className="login-field">
              Xác nhận mật khẩu <span className="required"></span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                required
              />
            </label>

            <button type="submit" className="btn btn-primary login-submit" disabled={submitting}>
              Tạo tài khoản
            </button>
          </form>

          <div className="login-footer">
            <p>
              Đã có tài khoản?{' '}
              <Link to="/login" className="login-link">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

