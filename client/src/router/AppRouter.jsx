import { Route, Routes } from 'react-router-dom'
import { JobDetailPage } from '../pages/public/JobDetailPage'
import { JobListPage } from '../pages/public/JobListPage'
import { ApplyPage } from '../pages/public/ApplyPage'
import { KanbanPage } from '../pages/hr/KanbanPage'
import { JobManagementPage } from '../pages/hr/JobManagementPage'
import { ApplicationReviewPage } from '../pages/hr/ApplicationReviewPage'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage'
import { AboutPage } from '../pages/about/AboutPage'
import { CandidatePage } from '../pages/candidate/CandidatePage'
import { AdminHrPage } from '../pages/admin/AdminHrPage'
import { ProtectedRoute } from '../components/common/ProtectedRoute'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<JobListPage />} />
      <Route path="/jobs" element={<JobListPage />} />
      <Route path="/jobs/:jobId" element={<JobDetailPage />} />
      <Route
        path="/apply/:jobId"
        element={
          <ProtectedRoute allowedRoles={['candidate']}>
            <ApplyPage />
          </ProtectedRoute>
        }
      />
       {/* Ứng viên / Auth */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route
        path="/candidate"
        element={
          <ProtectedRoute allowedRoles={['candidate']}>
            <CandidatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/kanban"
        element={
          <ProtectedRoute allowedRoles={['hr', 'admin']}>
            <KanbanPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/jobs"
        element={
          <ProtectedRoute allowedRoles={['hr', 'admin']}>
            <JobManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr/applications/:appId/review"
        element={
          <ProtectedRoute allowedRoles={['hr', 'admin']}>
            <ApplicationReviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/hr"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminHrPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

