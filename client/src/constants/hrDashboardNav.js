/**
 * Tham chiếu ổn định cho DashboardShell — tránh tạo array/object mới mỗi lần render.
 */
export const HR_DASH_NAV_BASE = Object.freeze([
  { to: '/hr/candidates', label: 'Quản lý bổ sung', end: true },
  { to: '/hr/chats', label: 'Tin nhắn', end: true },
  { to: '/hr/interview-schedules', label: 'Lịch phỏng vấn', end: true },
  { to: '/hr/jobs', label: 'Quản lý công việc', end: true },
  { to: '/sessions', label: 'Phiên', end: true }
])

export const HR_DASH_NAV_ADMIN_LINK = Object.freeze({
  to: '/admin/accounts',
  label: 'Quản lý tài khoản',
  end: true
})

/** Sprint 5 — Admin: phân tích ứng tuyển */
export const HR_DASH_NAV_ANALYTICS_LINK = Object.freeze({
  to: '/admin/analytics',
  label: 'Phân tích ứng tuyển',
  end: true
})

/** Trang admin (analytics + tài khoản): đủ mục HR + admin */
export const HR_DASH_NAV_FULL = Object.freeze([
  ...HR_DASH_NAV_BASE,
  HR_DASH_NAV_ANALYTICS_LINK,
  HR_DASH_NAV_ADMIN_LINK
])

/** Trang xem hồ sơ ứng tuyển — rút gọn điều hướng */
export const HR_APPLICATION_REVIEW_NAV = Object.freeze([
  { to: '/hr/chats', label: 'Tin nhắn', end: true },
  { to: '/hr/candidates', label: 'Quản lý bổ sung', end: true },
  { to: '/hr/jobs', label: 'Quản lý công việc', end: true }
])
