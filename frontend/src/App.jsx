import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth'
import Dashboard from './pages/Dashboard'
import Documents from './pages/Documents'
import Files from './pages/Files'
import ForgotPassword from './pages/ForgotPassword'
import Login from './pages/Login'
import RecordsPage from './pages/Records'

function Loading() {
  return <div className="login-page"><p className="loading-copy">Loading CPDO records...</p></div>
}

function Private({ children }) {
  const { user, ready } = useAuth()
  if (!ready) return <Loading />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function Guest({ children }) {
  const { user, ready } = useAuth()
  if (!ready) return <Loading />
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Guest><Login /></Guest>} />
      <Route path="/forgot-password" element={<Guest><ForgotPassword /></Guest>} />
      <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
      <Route path="/records/:date" element={<Private><RecordsPage /></Private>} />
      <Route path="/documents" element={<Private><Documents /></Private>} />
      <Route path="/files" element={<Private><Files /></Private>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
