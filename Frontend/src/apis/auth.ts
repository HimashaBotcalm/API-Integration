import api from '../libs/axios'
import { cookieUtils } from '../lib/cookies'

export interface AuthUser {
  id: string
  name: string
  email: string
  age?: number
  gender?: string
  phone?: string
  avatar?: string
  role: 'user' | 'admin' //Role in API response
  isEmailVerified: boolean
  createdAt: string
  lastLogin?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface SignupData {
  name: string
  email: string
  password: string
  role: 'user' | 'admin' //Role in signup request
  age?: number
  gender?: string
  phone?: string
}

export const authApi = {
  login: (data: LoginData) => api.post<{ message: string; user: AuthUser }>('/auth/login', data),
  signup: (data: SignupData) => api.post<{ message: string; user: AuthUser }>('/auth/signup', data),
  logout: async () => {
    try {
      const response = await api.post<{ message: string }>('/auth/logout')
      return response
    } finally {
      cookieUtils.removeToken()
    }
  },
  verify: () => api.get<{ user: AuthUser }>('/auth/verify'),
}