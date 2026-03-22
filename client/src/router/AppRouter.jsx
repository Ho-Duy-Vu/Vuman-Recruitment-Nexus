import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'

import { ProtectedRoute } from '../components/common/ProtectedRoute'
import { RoutePageFallback } from '../components/common/RoutePageFallback'
import {
  ALLOW_ROLES_ADMIN,
  ALLOW_ROLES_CANDIDATE,
  ALLOW_ROLES_HR_ADMIN
} from './roleConstants'

function lazyNamed(importFn, exportName) {
  return lazy(async () => {
    const m = await importFn()
    return { default: m[exportName] }
  })
}

/** Legacy URL → trang quản lý chat theo hồ sơ. */
function HrChatLegacyRedirect() {
  const { appId } = useParams()
  return <Navigate to={`/hr/chats/${appId}`} replace />
}

const JobListPage = lazyNamed(() => import('../pages/public/JobListPage'), 'JobListPage')
const JobDetailPage = lazyNamed(() => import('../pages/public/JobDetailPage'), 'JobDetailPage')
const ApplyPage = lazyNamed(() => import('../pages/public/ApplyPage'), 'ApplyPage')
const KanbanPage = lazyNamed(() => import('../pages/hr/KanbanPage'), 'KanbanPage')
const JobManagementPage = lazyNamed(() => import('../pages/hr/JobManagementPage'), 'JobManagementPage')
const HrInterviewSchedulesPage = lazyNamed(
  () => import('../pages/hr/HrInterviewSchedulesPage'),
  'HrInterviewSchedulesPage'
)
const ApplicationReviewPage = lazyNamed(() => import('../pages/hr/ApplicationReviewPage'), 'ApplicationReviewPage')
const HrChatsPage = lazyNamed(() => import('../pages/hr/HrChatsPage'), 'HrChatsPage')
const CandidatesDashboardPage = lazyNamed(
  () => import('../pages/hr/CandidatesDashboardPage'),
  'CandidatesDashboardPage'
)
const LoginPage = lazyNamed(() => import('../pages/auth/LoginPage'), 'LoginPage')
const RegisterPage = lazyNamed(() => import('../pages/auth/RegisterPage'), 'RegisterPage')
const ForgotPasswordPage = lazyNamed(() => import('../pages/auth/ForgotPasswordPage'), 'ForgotPasswordPage')
const ResetPasswordPage = lazyNamed(() => import('../pages/auth/ResetPasswordPage'), 'ResetPasswordPage')
const ChangePasswordPage = lazyNamed(() => import('../pages/auth/ChangePasswordPage'), 'ChangePasswordPage')
const SessionManagementPage = lazyNamed(() => import('../pages/SessionManagementPage'), 'SessionManagementPage')
const AboutPage = lazyNamed(() => import('../pages/about/AboutPage'), 'AboutPage')
const CandidatePage = lazyNamed(() => import('../pages/candidate/CandidatePage'), 'CandidatePage')
const CandidateApplicationReviewPage = lazyNamed(
  () => import('../pages/candidate/CandidateApplicationReviewPage'),
  'CandidateApplicationReviewPage'
)
const AdminAccountsPage = lazyNamed(() => import('../pages/admin/AdminAccountsPage'), 'AdminAccountsPage')
const AnalyticsPage = lazyNamed(() => import('../pages/admin/AnalyticsPage'), 'AnalyticsPage')
const ProfilePage = lazyNamed(() => import('../pages/account/ProfilePage'), 'ProfilePage')
const SettingsPage = lazyNamed(() => import('../pages/account/SettingsPage'), 'SettingsPage')
const HelpPage = lazyNamed(() => import('../pages/account/HelpPage'), 'HelpPage')
const VirtualListDemoPage = lazyNamed(
  () => import('../pages/demo/VirtualListDemoPage'),
  'VirtualListDemoPage'
)

export function AppRouter() {
  return (
    <Suspense fallback={<RoutePageFallback />}>
      <Routes>
        <Route path="/" element={<JobListPage />} />
        <Route path="/jobs" element={<JobListPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailPage />} />
        <Route
          path="/apply/:jobId"
          element={
            <ProtectedRoute allowedRoles={ALLOW_ROLES_CANDIDATE}>
              <ApplyPage />
            </ProtectedRoute>
          }
        />
        {/* Ứng viên / Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/demo/virtualization" element={<VirtualListDemoPage />} />
        <Route
          path="/candidate"
          element={
            <ProtectedRoute allowedRoles={ALLOW_ROLES_CANDIDATE}>
              <CandidatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <HelpPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/kanban"
          element={
            <ProtectedRoute allowedRoles={ALLOW_ROLES_HR_ADMIN}>
              <KanbanPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/candidates"
          element={
            <ProtectedRoute allowedRoles={ALLOW_ROLES_HR_ADMIN}>
              <CandidatesDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/jobs"
          element={
            <ProtectedRoute allowedRoles={ALLOW_ROLES_HR_ADMIN}>
              <JobManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/interview-schedules"
          element={
            <ProtectedRoute allowedRoles={ALLOW_ROLES_HR_ADMIN}>
              <HrInterviewSchedulesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/applications/:appId/review"
          element={
            <ProtectedRoute allowedRoles={ALLOW_ROLES_HR_ADMIN}>
              <ApplicationReviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/chats/:appId"
          element={
            <ProtectedRoute allowedRoles={ALLOW_ROLES_HR_ADMIN}>
              <HrChatsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/chats"
          element={
            <ProtectedRoute allowedRoles={ALLOW_ROLES_HR_ADMIN}>
              <HrChatsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hr/chat/:appId"
          element={
            <ProtectedRoute allowedRoles={ALLOW_ROLES_HR_ADMIN}>
              <HrChatLegacyRedirect />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/applications/:appId/review"
          element={
            <ProtectedRoute allowedRoles={ALLOW_ROLES_CANDIDATE}>
              <CandidateApplicationReviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/accounts"
          element={
            <ProtectedRoute allowedRoles={ALLOW_ROLES_ADMIN}>
              <AdminAccountsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={ALLOW_ROLES_ADMIN}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sessions"
          element={
            <ProtectedRoute>
              <SessionManagementPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  )
}
