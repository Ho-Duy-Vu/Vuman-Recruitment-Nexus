import axios from 'axios'
import { store } from '../store/store'
import { logout, setCredentials } from '../store/authSlice'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

api.interceptors.request.use(
  (config) => {
    const state = store.getState()
    const token = state.auth.accessToken

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

let isRefreshing = false
let pendingRequests = []

const processQueue = (error, token = null) => {
  pendingRequests.forEach((promise) => {
    if (error) {
      promise.reject(error)
    } else {
      promise.resolve(token)
    }
  })
  pendingRequests = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({
          resolve: (token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            resolve(api(originalRequest))
          },
          reject
        })
      })
    }

    isRefreshing = true

    try {
      const state = store.getState()
      const refreshToken = state.auth.refreshToken

      if (!refreshToken) {
        throw new Error('No refresh token')
      }

      const res = await api.post('/auth/refresh-token', { refreshToken })
      const { accessToken: newAccessToken, refreshToken: newRefreshToken, user } = res.data.data

      store.dispatch(
        setCredentials({
          user: user || state.auth.user,
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        })
      )

      processQueue(null, newAccessToken)
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      store.dispatch(logout())
      window.location.href = '/login'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  }
)

export default api

