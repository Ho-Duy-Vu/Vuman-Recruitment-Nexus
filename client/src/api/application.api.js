import api from './axios.instance'

export const fetchApplicationsByJob = (jobId) =>
  api.get('/applications', { params: { jobId } }).then((r) => r.data.data.applications)

export const submitApplication = (jobId, { country, city, gender, source, messageToHR, cvFile }) => {
  const formData = new FormData()
  formData.append('jobId', jobId)
  formData.append('country', country || '')
  formData.append('city', city || '')
  formData.append('gender', gender || '')
  formData.append('source', source || '')
  formData.append('messageToHR', messageToHR || '')
  if (cvFile) formData.append('cv', cvFile)
  return api.post('/applications', formData).then((r) => r.data.data)
}

export const changeApplicationStage = (appId, newStage, scheduleData) =>
  api
    .patch(`/applications/${appId}/stage`, { newStage, ...(scheduleData ? { scheduleData } : {}) })
    .then((r) => r.data.data)

export const updateApplicationNote = (appId, hrNote) =>
  api.patch(`/applications/${appId}/note`, { hrNote }).then((r) => r.data.data)

export const fetchCvUrl = (appId) =>
  api.get(`/applications/${appId}/cv-url`).then((r) => r.data.data)
