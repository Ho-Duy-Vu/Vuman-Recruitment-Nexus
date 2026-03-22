import api from './axios.instance'

export const fetchChatThreads = () => api.get('/chat/threads')

export const fetchChatMessages = (applicationId, page = 1, limit = 50) =>
  api.get(`/chat/${applicationId}/messages`, { params: { page, limit } })

export const postChatMessage = (applicationId, content) =>
  api.post(`/chat/${applicationId}/messages`, { content })

export const markChatRead = (applicationId) => api.post(`/chat/${applicationId}/read`)
