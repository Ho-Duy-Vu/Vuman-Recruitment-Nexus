import api from './axios.instance'

/**
 * @returns {Promise<Array<{ id, kind, title, message, at, read, applicationId? }>>}
 */
export async function fetchCandidateNotifications() {
  const { data } = await api.get('/candidate/notifications')
  return data?.data?.items ?? []
}

export async function markCandidateNotificationReadApi(notificationId) {
  const { data } = await api.patch(`/candidate/notifications/${encodeURIComponent(notificationId)}/read`)
  return data?.data?.item
}

export async function markAllCandidateNotificationsReadApi() {
  const { data } = await api.patch('/candidate/notifications/read-all')
  return data?.data
}
