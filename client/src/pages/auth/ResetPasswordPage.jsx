import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { resetPassword } from '../../api/auth.api'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const token = searchParams.get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const normalizedToken = useMemo(() => String(token), [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!normalizedToken) {
      setError('Thiếu token đặt lại mật khẩu.')
      return
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Mật khẩu mới tối thiểu 6 ký tự.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu không khớp.')
      return
    }

    setSubmitting(true)
    try {
      await resetPassword({ token: normalizedToken, newPassword })
      setSuccess('Đổi mật khẩu thành công. Đang chuyển về trang đăng nhập...')
      setTimeout(() => {
        navigate('/login')
      }, 1200)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <div className="auth-hero-inner">
          <h1 className="auth-hero-title">Đặt lại mật khẩu</h1>
        </div>
      </section>

      <section className="auth-main">
        <div className="login-card">
          <h2 className="login-title">Mật khẩu mới</h2>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <p className="error-text login-error">{error}</p>}
            {success && <p className="success-text" style={{ color: '#065f46', marginTop: 0 }}>{success}</p>}

            <label className="login-field">
              Mật khẩu mới <span className="required">*</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                required
              />
            </label>

            <label className="login-field">
              Xác nhận mật khẩu <span className="required">*</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                required
              />
            </label>

            <button type="submit" className="btn btn-primary login-submit" disabled={submitting}>
              {submitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Quay lại{' '}
              <span
                role="button"
                tabIndex={0}
                onClick={() => navigate('/login')}
                onKeyDown={(e) => { if (e.key === 'Enter') navigate('/login') }}
                className="login-link"
                style={{ cursor: 'pointer' }}
              >
                Đăng nhập
              </span>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

