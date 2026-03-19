import api from './axios.instance'

export const fetchMyCandidateTasks = () =>
  api.get('/candidate-tasks/my').then((r) => r.data.data)

export const createCandidateTask = (payload) =>
  api.post('/candidate-tasks', payload).then((r) => r.data.data.task)

export const fetchCandidateTasks = (params) =>
  api.get('/candidate-tasks', { params }).then((r) => r.data.data)

export const updateCandidateTask = (taskId, payload) =>
  api.patch(`/candidate-tasks/${taskId}`, payload).then((r) => r.data.data.task)

export const deleteCandidateTask = (taskId) =>
  api.delete(`/candidate-tasks/${taskId}`).then((r) => r.data.data)

export const uploadTaskDocument = (taskId, { docType, file }) => {
  const formData = new FormData()
  formData.append('docType', docType)
  formData.append('file', file)
  return api.post(`/candidate-tasks/${taskId}/documents`, formData).then((r) => r.data.data)
}

export const fetchTaskDocuments = (taskId) =>
  api.get(`/candidate-tasks/${taskId}/documents`).then((r) => r.data.data.documents)

