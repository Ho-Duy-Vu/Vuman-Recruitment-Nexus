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

