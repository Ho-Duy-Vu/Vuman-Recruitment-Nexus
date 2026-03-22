import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import { changePassword } from '../../api/auth.api'
import { logout } from '../../store/authSlice'

export function ChangePasswordPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!currentPassword) {
      setError('Vui lòng nhập mật khẩu hiện tại.')
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
      await changePassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccess('Đổi mật khẩu thành công. Đang đăng xuất...')

      setTimeout(() => {
        dispatch(logout())
        navigate('/login')
      }, 1200)
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <div className="auth-hero-inner">
          <h1 className="auth-hero-title">Đổi mật khẩu</h1>
        </div>
      </section>

      <section className="auth-main">
        <div className="login-card">
          <h2 className="login-title">Thông tin bảo mật</h2>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <p className="error-text login-error">{error}</p>}
            {success && <p style={{ color: '#065f46', marginTop: 0 }}>{success}</p>}

            <label className="login-field">
              Mật khẩu hiện tại <span className="required"></span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                required
              />
            </label>

            <label className="login-field">
              Mật khẩu mới <span className="required"></span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                required
              />
            </label>

            <label className="login-field">
              Xác nhận mật khẩu <span className="required"></span>
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
        </div>
      </section>
    </main>
  )
}

