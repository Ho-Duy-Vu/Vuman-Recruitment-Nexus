import api from './axios.instance'

export const fetchActiveSessions = () =>
  api.get('/auth/sessions').then((r) => r.data.data.sessions)

export const revokeSession = (sessionId) =>
  api.delete(`/auth/sessions/${sessionId}`).then((r) => r.data.data)

export const revokeAllSessions = () =>
  api.delete('/auth/sessions').then((r) => r.data.data)

