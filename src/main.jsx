import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { DashboardDataProvider } from './context/DashboardDataContext'
import { SessionProvider } from './context/SessionContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SessionProvider>
      <DashboardDataProvider>
        <App />
      </DashboardDataProvider>
    </SessionProvider>
  </React.StrictMode>
)
