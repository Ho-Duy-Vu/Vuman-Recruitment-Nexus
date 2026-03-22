import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'

import { store } from './store/store'
import { AuthUserSync } from './components/auth/AuthUserSync'
import { Navbar } from './components/common/Navbar'
import { AppRouter } from './router/AppRouter'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { I18nProvider } from './contexts/I18nContext'
import { CandidateInboxProvider } from './contexts/CandidateInboxContext'
import './App.css'

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthUserSync />
        <I18nProvider>
          <CandidateInboxProvider>
          <div className="app-shell">
            <Navbar />
            <ErrorBoundary>
              <AppRouter />
            </ErrorBoundary>
          </div>
          </CandidateInboxProvider>
        </I18nProvider>
      </BrowserRouter>
    </Provider>
  )
}

export default App
