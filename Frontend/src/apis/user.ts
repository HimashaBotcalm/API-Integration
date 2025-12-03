import api from '../libs/axios'
import { User } from '../user/user-store'

export const userApi = {
  getUsers: (page = 1, limit = 10) => api.get(`/users?page=${page}&limit=${limit}`),
  createUser: (user: Omit<User, '_id' | 'createdAt'>) => api.post<User>('/users', user),
  updateUser: (id: string, user: Partial<User>) => api.put<User>(`/users/${id}`, user),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
}