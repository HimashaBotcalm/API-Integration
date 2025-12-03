import axios from 'axios'
import { cookieUtils } from '../lib/cookies'

const api = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000,
  withCredentials: true,
})

// Request interceptor to add token to headers
api.interceptors.request.use(
  (config) => {
    const token = cookieUtils.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Token expired or invalid, remove token and trigger logout
      cookieUtils.removeToken()
      window.dispatchEvent(new CustomEvent('auth:logout'))
    }
    return Promise.reject(error)
  }
)

// Auto-logout checker - checks token status every 5 seconds
let tokenCheckInterval: NodeJS.Timeout | null = null

export const startTokenChecker = () => {
  if (tokenCheckInterval) return // Already running
  
  tokenCheckInterval = setInterval(async () => {
    try {
      await api.get('/auth/status')
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        cookieUtils.removeToken()
        window.dispatchEvent(new CustomEvent('auth:logout'))
        stopTokenChecker()
      }
    }
  }, 5000) // Check every 5 seconds
}

export const stopTokenChecker = () => {
  if (tokenCheckInterval) {
    clearInterval(tokenCheckInterval)
    tokenCheckInterval = null
  }
}

export default api