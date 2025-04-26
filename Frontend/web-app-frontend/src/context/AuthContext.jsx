import React, { createContext, useState, useEffect, useContext } from 'react'
import { signIn, signUp } from '../api/auth'
import axiosInstance from '../api/axiosConfig'

const AuthContext = createContext()

// --- Shared utility for fetching user profile ---
const fetchUserProfile = async (token, setCurrentUser, setIsAuthenticated) => {
  try {
    const response = await axiosInstance.get('/auth/me', {
      headers: { 'x-auth-token': token }
    })
    setCurrentUser(response.data.user)
    setIsAuthenticated(true)
    localStorage.setItem('user', JSON.stringify(response.data.user))
  } catch (error) {
    setCurrentUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on page load
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        await fetchUserProfile(token, setCurrentUser, setIsAuthenticated)
      } else {
        setIsAuthenticated(false)
        setCurrentUser(null)
      }
      setLoading(false)
    }
    checkLoggedIn()
  }, [])

  const login = async (credentials) => {
    const data = await signIn(credentials)
    localStorage.setItem('token', data.token)
    await fetchUserProfile(data.token, setCurrentUser, setIsAuthenticated)
    return data
  }

  const register = async (userInfo) => {
    const data = await signUp(userInfo)
    if (data.token) {
      localStorage.setItem('token', data.token)
      await fetchUserProfile(data.token, setCurrentUser, setIsAuthenticated)
    }
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setCurrentUser(null)
    setIsAuthenticated(false)
  }

  // Auto-logout on 401/403 from any API call
  useEffect(() => {
    const interceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if ([401, 403].includes(error.response?.status)) {
          logout()
        }
        return Promise.reject(error)
      }
    )
    return () => axiosInstance.interceptors.response.eject(interceptor)
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
