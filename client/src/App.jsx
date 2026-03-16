import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Provider } from 'react-redux'

import { store } from './store/store'
import { JobDetailPage } from './pages/public/JobDetailPage'
import { JobListPage } from './pages/public/JobListPage'
import { ApplyPage } from './pages/public/ApplyPage'
import { KanbanPage } from './pages/hr/KanbanPage'
import { ApplicationReviewPage } from './pages/hr/ApplicationReviewPage'
import './App.css'

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<JobListPage />} />
          <Route path="/jobs" element={<JobListPage />} />
          <Route path="/jobs/:jobId" element={<JobDetailPage />} />
          <Route path="/apply/:jobId" element={<ApplyPage />} />
          <Route path="/hr/kanban" element={<KanbanPage />} />
          <Route path="/hr/applications/:appId/review" element={<ApplicationReviewPage />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  )
}

export default App
