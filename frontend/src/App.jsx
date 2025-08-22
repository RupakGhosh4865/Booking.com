import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import PatientDashboard from './pages/PatientDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Navbar from './components/Navbar'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar />}
      <div className="container mx-auto px-4 py-8">
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Register />} 
          />
          <Route 
            path="/dashboard" 
            element={
              user ? (
                user.role === 'patient' ? <PatientDashboard /> : <Navigate to="/admin" />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route 
            path="/admin" 
            element={
              user ? (
                user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
          <Route 
            path="/" 
            element={
              user ? (
                <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
        </Routes>
      </div>
    </div>
  )
}

export default App
