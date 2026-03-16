import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload
      state.user = user || null
      state.accessToken = accessToken || null
      state.refreshToken = refreshToken || null
      state.isAuthenticated = Boolean(accessToken)
    },
    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.isAuthenticated = false
    }
  }
})

export const { setCredentials, logout } = authSlice.actions

export const selectCurrentUser = (state) => state.auth.user
export const selectAccessToken = (state) => state.auth.accessToken
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectRefreshToken = (state) => state.auth.refreshToken

export default authSlice.reducer

