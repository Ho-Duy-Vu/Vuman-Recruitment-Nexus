/**
 * Portal ứng viên — gom API dùng trên trang candidate (TASK 25).
 */
export {
  fetchMyApplications,
  withdrawApplication,
  fetchCvUrl,
  changeApplicationStage,
  fetchApplicationInterview,
  fetchApplicationInterviews
} from './application.api'

import api from './axios.instance'

export const fetchApplicationDetail = (appId) =>
  api.get(`/applications/${appId}`).then((r) => r.data.data.application)
