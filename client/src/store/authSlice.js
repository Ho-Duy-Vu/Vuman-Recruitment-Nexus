import { createSlice } from '@reduxjs/toolkit'

const STORAGE_KEY = 'vuman_auth'

const loadStoredAuth = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return {
      user: parsed.user || null,
      accessToken: parsed.accessToken || null,
      refreshToken: parsed.refreshToken || null,
      isAuthenticated: Boolean(parsed.accessToken)
    }
  } catch {
    return null
  }
}

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false
}

const authSlice = createSlice({
  name: 'auth',
  initialState: loadStoredAuth() || initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload
      state.user = user || null
      state.accessToken = accessToken || null
      state.refreshToken = refreshToken || null
      state.isAuthenticated = Boolean(accessToken)

      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            user: state.user,
            accessToken: state.accessToken,
            refreshToken: state.refreshToken
          })
        )
      } catch {
        // ignore storage failures
      }
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false

      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        // ignore storage failures
      }
    }
  }
})

export const { setCredentials, logout } = authSlice.actions

export const selectCurrentUser = (state) => state.auth.user
export const selectAccessToken = (state) => state.auth.accessToken
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectRefreshToken = (state) => state.auth.refreshToken

export default authSlice.reducer

