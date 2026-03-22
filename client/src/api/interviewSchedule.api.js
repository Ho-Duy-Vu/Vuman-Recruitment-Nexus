import api from './axios.instance'

export const fetchHrInterviewSchedules = (params = {}) =>
  api.get('/hr/interview-schedules', { params }).then((r) => r.data.data)

export const createHrInterviewSchedule = (body) =>
  api.post('/hr/interview-schedules', body).then((r) => r.data.data.schedule)

export const updateHrInterviewSchedule = (scheduleId, body) =>
  api.patch(`/hr/interview-schedules/${scheduleId}`, body).then((r) => r.data.data.schedule)

export const deleteHrInterviewSchedule = (scheduleId) =>
  api.delete(`/hr/interview-schedules/${scheduleId}`).then((r) => r.data.data)
