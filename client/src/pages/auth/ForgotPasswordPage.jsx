import { useState } from 'react'
import { Link } from 'react-router-dom'
import { forgotPassword } from '../../api/auth.api'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [resetToken, setResetToken] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setResetToken(null)
    setSubmitting(true)
    try {
      const data = await forgotPassword({ email })
      // Demo mode: backend trả resetToken trong response
      setResetToken(data.resetToken)
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể tạo yêu cầu đặt lại mật khẩu. Vui lòng thử lại.'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <div className="auth-hero-inner">
          <h1 className="auth-hero-title">Quên mật khẩu</h1>
        </div>
      </section>

      <section className="auth-main">
        <div className="login-card">
          <h2 className="login-title">Đặt lại mật khẩu</h2>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <p className="error-text login-error">{error}</p>}

            <label className="login-field">
              Địa chỉ email <span className="required">*</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ung.vien@gmail.com"
                required
              />
            </label>

            <button type="submit" className="btn btn-primary login-submit" disabled={submitting}>
              Gửi yêu cầu
            </button>
          </form>

          {resetToken && (
            <div className="forgot-result">
              <p className="candidate-muted">
                Demo mode: Đây là <b>resetToken</b> (dùng cho API `reset-password`):
              </p>
              <div className="forgot-token">{resetToken}</div>
            </div>
          )}

          <div className="login-footer">
            <p>
              Quay lại{' '}
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

