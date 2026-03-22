import api from './axios.instance'

/** Khớp với submitApplicationSchema (server) — UI có thể dùng nhãn tiếng Việt */
const SOURCE_TO_API = {
  LinkedIn: 'LinkedIn',
  Facebook: 'Facebook',
  'Giới thiệu từ bạn bè': 'Referral',
  'Website công ty': 'Company Website',
  Khác: 'Other',
  Referral: 'Referral',
  'Company Website': 'Company Website',
  Other: 'Other'
}

export const fetchApplicationsByJob = (jobId) =>
  api.get('/applications', { params: { jobId } }).then((r) => r.data.data.applications)

export const submitApplication = (jobId, {
  country,
  city,
  gender,
  source,
  messageToHR,
  cvFile,
  skills,
  awardsAndCertifications,
  companies,
  fullName,
  university,
  degreeLevel,
  graduationYear,
  portfolioUrl,
  linkedinUrl,
  phoneNumber,
  homeAddress,
  postalCode,
  cvConsent,
  workedAtThisCompany
}) => {
  const formData = new FormData()
  const sourceApi = SOURCE_TO_API[source] || source || 'Other'
  formData.append('jobId', jobId)
  formData.append('country', country || '')
  formData.append('city', city || '')
  formData.append('gender', gender || '')
  formData.append('source', sourceApi)
  formData.append('messageToHR', messageToHR || '')
  formData.append('fullName', fullName || '')
  formData.append('skills', skills || '')
  formData.append('awardsAndCertifications', awardsAndCertifications || '')
  if (Array.isArray(companies)) {
    companies.forEach((c) => {
      if (c !== undefined && c !== null) formData.append('companies', String(c))
    })
  }
  formData.append('university', university || '')
  formData.append('degreeLevel', degreeLevel || '')
  formData.append('graduationYear', graduationYear || '')
  formData.append('portfolioUrl', portfolioUrl || '')
  formData.append('linkedinUrl', linkedinUrl || '')
  formData.append('phoneNumber', phoneNumber || '')
  formData.append('homeAddress', homeAddress || '')
  formData.append('postalCode', postalCode || '')
  formData.append('cvConsent', cvConsent || '')
  formData.append('workedAtThisCompany', workedAtThisCompany || '')
  if (cvFile) formData.append('cv', cvFile)
  return api.post('/applications', formData).then((r) => r.data.data)
}

export const fetchMyApplications = () => {
  return api.get('/applications/my').then((r) => r.data.data.applications)
}

export const changeApplicationStage = (appId, newStage, scheduleData) =>
  api
    .patch(`/applications/${appId}/stage`, { newStage, ...(scheduleData ? { scheduleData } : {}) })
    .then((r) => r.data.data)

export const updateApplicationNote = (appId, hrNote) =>
  api.patch(`/applications/${appId}/note`, { hrNote }).then((r) => r.data.data)

export const fetchCvUrl = (appId) =>
  api.get(`/applications/${appId}/cv-url`).then((r) => r.data.data)

export const withdrawApplication = (appId) =>
  api.delete(`/applications/${appId}`).then((r) => r.data.data)

export const fetchAllApplicationsForHR = ({ stage, page, limit } = {}) =>
  api.get('/applications/hr', { params: { stage, page, limit } }).then((r) => r.data.data)

export const bulkRejectApplications = (jobId, applicationIds) =>
  api
    .post('/applications/bulk-reject', { jobId, applicationIds })
    .then((r) => r.data.data.summary)

/** Danh sách lịch PV (mới nhất trước) — server trả `schedules` */
export const fetchApplicationInterviews = (appId) =>
  api.get(`/applications/${appId}/interview`).then((r) => r.data.data.schedules || [])

/** @deprecated dùng fetchApplicationInterviews */
export const fetchApplicationInterview = fetchApplicationInterviews
