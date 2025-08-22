import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../utils/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored token on app load
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData))
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await api.post('/login', { email, password })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      setUser(user)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error?.message || 'Login failed' 
      }
    }
  }

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/register', { name, email, password })
      const { token, user } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      setUser(user)
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error?.message || 'Registration failed' 
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
