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

export const changePassword = async ({ currentPassword, newPassword }) => {
  const res = await api.post('/auth/change-password', { currentPassword, newPassword })
  return res.data.data
}

export const logoutApi = async () => {
  await api.post('/auth/logout')
}

/** User đầy đủ từ DB (applyProfile, phone, …) — dùng sau F5 hoặc đồng bộ Redux */
export const fetchCurrentUser = async () => {
  const res = await api.get('/auth/me')
  const d = res.data?.data
  return d?.user ?? d
}

/** Ứng viên: cập nhật hồ sơ (đồng bộ form Apply) */
export const updateCandidateProfile = async (body) => {
  const res = await api.patch('/auth/profile', body)
  const d = res.data?.data
  return d?.user ?? d
}

