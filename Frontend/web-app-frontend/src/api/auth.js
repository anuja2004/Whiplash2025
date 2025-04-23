// src/api/auth.js

import axios from 'axios'

const API_BASE = 'http://localhost:5000/api/auth' // replace with actual base URL

export const signIn = async (credentials) => {
  try {
    console.log('signIn called with:', credentials)
    const response = await axios.post(`${API_BASE}/login`, credentials)
    return response.data
  } catch (error) {
    console.log('Error in signIn:', error)
    throw error.response?.data || error.message
  }
}

export const signUp = async (userInfo) => {
  try {
    console.log('signUp called with:', userInfo)
    const response = await axios.post(`${API_BASE}/register`, userInfo)
    return response.data
  } catch (error) {
    throw error.response?.data || error.message
  }
}
