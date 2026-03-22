import api from './axios.instance'

export const fetchHRList = () => {
  return api.get('/admin/hr').then((r) => r.data.data.users)
}

export const createHR = ({ email, fullName, department, password }) => {
  return api.post('/admin/hr', { email, fullName, department, password }).then((r) => r.data.data)
}

export const updateHR = (id, updates) => {
  return api.patch(`/admin/hr/${id}`, updates).then((r) => r.data.data.user)
}

export const deleteHR = (id) => {
  return api.delete(`/admin/hr/${id}`).then((r) => r.data.data.user)
}

export const fetchAllUsers = () => {
  return api.get('/admin/users').then((r) => r.data.data.users)
}

export const createCandidate = ({ email, fullName, phone, password }) => {
  return api.post('/admin/candidate', { email, fullName, phone, password }).then((r) => r.data.data)
}

export const updateCandidate = (id, updates) => {
  return api.patch(`/admin/candidate/${id}`, updates).then((r) => r.data.data.user)
}

export const deleteCandidate = (id) => {
  return api.delete(`/admin/candidate/${id}`).then((r) => r.data.data.user)
}

/** Sprint 5 — GET /api/admin/analytics (admin only) */
export const fetchApplicationAnalytics = (params = {}) => {
  return api.get('/admin/analytics', { params }).then((r) => r.data.data)
}

