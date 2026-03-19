import api from './axios.instance'

export const login = async ({ email, password }) => {
  const res = await api.post('/auth/login', { email, password })
  return res.data.data
}

export const registerCandidate = async ({ email, password, fullName }) => {
  const res = await api.post('/auth/register', { email, password, fullName })
  return res.data.data
}

export const forgotPassword = async ({ email }) => {
  const res = await api.post('/auth/forgot-password', { email })
  return res.data.data
}

export const resetPassword = async ({ token, newPassword }) => {
  const res = await api.post('/auth/reset-password', { token, newPassword })
  return res.data.data
}

export const logoutApi = async () => {
  await api.post('/auth/logout')
}

