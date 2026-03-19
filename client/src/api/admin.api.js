import api from './axios.instance'

export const fetchHRList = () => {
  return api.get('/admin/hr').then((r) => r.data.data.users)
}

export const createHR = ({ email, fullName, department }) => {
  return api.post('/admin/hr', { email, fullName, department }).then((r) => r.data.data)
}

export const updateHR = (id, updates) => {
  return api.patch(`/admin/hr/${id}`, updates).then((r) => r.data.data.user)
}

export const deleteHR = (id) => {
  return api.delete(`/admin/hr/${id}`).then((r) => r.data.data.user)
}

export const forceResetHRPassword = (id) => {
  return api.post(`/admin/hr/${id}/force-reset-password`).then((r) => r.data.data)
}

