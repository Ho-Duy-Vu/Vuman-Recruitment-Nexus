import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'

import { store } from './store/store'
import { Navbar } from './components/common/Navbar'
import { AppRouter } from './router/AppRouter'
import './App.css'

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="app-shell">
          <Navbar />
          <AppRouter />
        </div>
      </BrowserRouter>
    </Provider>
  )
}

export default App
