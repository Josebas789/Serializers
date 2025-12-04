import { createContext, useContext, useEffect, useState } from 'react'
import { api, setAuthToken } from '../api'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'))

  useEffect(() => {
    // 1. Configurar token inicial al cargar
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setAuthToken(storedToken)
      setToken(storedToken)
      setIsAuthenticated(true)
    }

    // 2. Escuchar evento de logout forzado (desde api.js)
    const handleLogoutEvent = () => logout()
    window.addEventListener('auth:logout', handleLogoutEvent)

    return () => {
      window.removeEventListener('auth:logout', handleLogoutEvent)
    }
  }, [])

  const login = (accessToken, refreshToken) => {
    localStorage.setItem('token', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    setAuthToken(accessToken)
    setToken(accessToken)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    setAuthToken(null)
    setToken(null)
    setIsAuthenticated(false)
  }

  const value = {
    token,
    isAuthenticated,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}