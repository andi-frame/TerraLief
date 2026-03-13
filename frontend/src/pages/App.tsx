import './App.css'
import Navbar from '../component/Navbar'
import { AuthProvider } from '../context/AuthContext'
import { useAuth } from '../context/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import HomePage from './HomePage'
import SheltersPage from './SheltersPage'
import RoutesPage from './RoutesPage'
import ReportRoad from './ReportRoad'
import AuthPage from './AuthPage.tsx'

const queryClient = new QueryClient()

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return <main className="home-page" />
  }

  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isBootstrapping } = useAuth()

  if (isBootstrapping) {
    return <main className="home-page" />
  }

  if (isLoggedIn) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function AppLayout() {
  const location = useLocation()
  const isMapHeavyPage =
    location.pathname.startsWith('/routes') ||
    location.pathname.startsWith('/shelters') ||
    location.pathname.startsWith('/report-road')
  const isAuthPage = location.pathname.startsWith('/auth')

  return (
    <div className="home-page">
      <Navbar />

      <Routes>
        <Route
          path="/auth"
          element={
            <PublicOnlyRoute>
              <AuthPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shelters"
          element={
            <ProtectedRoute>
              <SheltersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/routes/*"
          element={
            <ProtectedRoute>
              <RoutesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report-road/*"
          element={
            <ProtectedRoute>
              <ReportRoad />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>

      {!isMapHeavyPage && !isAuthPage && (
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