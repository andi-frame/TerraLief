import './App.css'
import Navbar from '../component/Navbar'
import { AuthProvider } from '../context/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import HomePage from './HomePage'
import SheltersPage from './SheltersPage'
import RoutesPage from './RoutesPage'
import ReportRoad from './ReportRoad'

const queryClient = new QueryClient()

function AppLayout() {
  const location = useLocation()
  const isMapHeavyPage =
    location.pathname.startsWith('/routes') ||
    location.pathname.startsWith('/shelters') ||
    location.pathname.startsWith('/report-road')

  return (
    <div className="home-page">
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shelters" element={<SheltersPage />} />
        <Route path="/routes/*" element={<RoutesPage />} />
        <Route path="/report-road/*" element={<ReportRoad />}/>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!isMapHeavyPage && (
        <>
          <section className="note-section">
            <div className="note-icon" />
            <img className="note-logo" src="/terralieflogo.svg" alt="Terralief logo" />
            <p>
              Information is based on community reports and AI analysis. Always follow official
              guidance.
            </p>
          </section>

          <footer>© 2026 TerraLief. All rights reserved.</footer>
        </>
      )}
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App