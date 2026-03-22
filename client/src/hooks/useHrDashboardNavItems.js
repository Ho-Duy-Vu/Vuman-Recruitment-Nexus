import { useMemo } from 'react'
import { HR_DASH_NAV_BASE, HR_DASH_NAV_FULL } from '../constants/hrDashboardNav'

/**
 * Nav HR dashboard: cùng reference khi isAdmin không đổi; HR không có mục admin/analytics.
 */
export function useHrDashboardNavItems(isAdmin) {
  return useMemo(() => (isAdmin ? HR_DASH_NAV_FULL : HR_DASH_NAV_BASE), [isAdmin])
}
