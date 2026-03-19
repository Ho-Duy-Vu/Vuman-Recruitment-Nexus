import api from './axios.instance'

export const fetchOpenJobs = async () => {
  const res = await api.get('/jobs')
  return res.data.data.jobs
}

export const fetchJobById = async (id) => {
  const res = await api.get(`/jobs/${id}`)
  return res.data.data.job
}

export const fetchAllJobs = async (filters = {}) => {
  const res = await api.get('/jobs/all', { params: filters })
  return res.data.data
}

export const createJob = async (payload) => {
  const res = await api.post('/jobs', payload)
  return res.data.data.job
}

export const updateJob = async (jobId, payload) => {
  const res = await api.patch(`/jobs/${jobId}`, payload)
  return res.data.data.job
}

export const publishJob = async (jobId) => {
  const res = await api.patch(`/jobs/${jobId}/publish`)
  return res.data.data.job
}

export const closeJob = async (jobId) => {
  const res = await api.patch(`/jobs/${jobId}/close`)
  return res.data.data.job
}

export const deleteJob = async (jobId) => {
  const res = await api.delete(`/jobs/${jobId}`)
  return res.data.data.job
}

