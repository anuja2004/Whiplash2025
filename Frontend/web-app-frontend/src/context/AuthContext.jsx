import React, { createContext, useState, useEffect, useContext } from 'react'
import { signIn, signUp } from '../api/auth'
import axiosInstance from '../api/axiosConfig'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on page load
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem('token')
        const user = JSON.parse(localStorage.getItem('user'))
        
        if (token && user) {
          setCurrentUser(user)
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Error checking authentication status:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }
    
    checkLoggedIn()
  }, [])

  const login = async (credentials) => {
    try {
      const data = await signIn(credentials)
      
      // Save token and user data to localStorage
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      setCurrentUser(data.user)
      setIsAuthenticated(true)
      return data
    } catch (error) {
      throw error
    }
  }

  const register = async (userInfo) => {
    try {
      const data = await signUp(userInfo)
      // You may want to automatically log the user in after a successful registration.
      return data
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    setCurrentUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isAuthenticated, 
      loading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext)
