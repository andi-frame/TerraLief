import './App.css'
import Navbar from '../component/Navbar'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './HomePage'
import SheltersPage from './SheltersPage'
import RoutesPage from './RoutesPage'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="home-page">
          <Navbar />

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shelters" element={<SheltersPage />} />
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <section className="note-section">
            <div className="note-icon" />
            <p>
              Information is based on community reports and AI analysis. Always follow official
              guidance.
            </p>
          </section>

          <footer>© 2026 TerraLief. All rights reserved.</footer>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App