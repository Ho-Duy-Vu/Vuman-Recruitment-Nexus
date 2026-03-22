import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { fetchCurrentUser } from '../../api/auth.api'
import { selectAccessToken, selectRefreshToken, setCredentials } from '../../store/authSlice'

/**
 * Khi có access token: tải user đầy đủ từ GET /auth/me (applyProfile, …).
 * Tránh Redux/localStorage chỉ có user lỏng từ login cũ hoặc thiếu applyProfile.
 */
export function AuthUserSync() {
  const dispatch = useDispatch()
  const accessToken = useSelector(selectAccessToken)
  const refreshToken = useSelector(selectRefreshToken)

  useEffect(() => {
    if (!accessToken) return

    let cancelled = false
    ;(async () => {
      try {
        const user = await fetchCurrentUser()
        if (!cancelled && user) {
          dispatch(
            setCredentials({
              user,
              accessToken,
              refreshToken
            })
          )
        }
      } catch {
        // 401: interceptor xử lý logout
      }
    })()

    return () => {
      cancelled = true
    }
  }, [accessToken, dispatch, refreshToken])

  return null
}
