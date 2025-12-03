import { create } from 'zustand'
import { userApi } from '../apis/user'

export interface User {
  _id?: string
  name: string
  email: string
  password?: string
  age?: number
  gender?: string
  createdAt?: string
}

interface UserStore {
  users: User[]
  loading: boolean
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  fetchUsers: (page?: number) => Promise<void>
  addUser: (user: Omit<User, '_id' | 'createdAt'>) => Promise<void>
  updateUser: (id: string, user: Partial<User>) => Promise<void>
  deleteUser: (id: string) => Promise<void>
}

export const useUserStore = create<UserStore>()((set, get) => ({
  users: [],
  loading: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  
  fetchUsers: async (page = 1) => {
    set({ loading: true })
    try {
      const response = await userApi.getUsers(page, 10)
      set({ 
        users: response.data.users, 
        pagination: response.data.pagination,
        loading: false 
      })
    } catch (error) {
      console.error('Error fetching users:', error)
      set({ loading: false })
    }
  },
  
  addUser: async (user) => {
    try {
      const response = await userApi.createUser(user)
      set((state) => ({ users: [...state.users, response.data] }))
    } catch (error) {
      console.error('Error adding user:', error)
      throw error
    }
  },
  
  updateUser: async (id, updatedUser) => {
    try {
      const response = await userApi.updateUser(id, updatedUser)
      set((state) => ({
        users: state.users.map((user) =>
          user._id === id ? response.data : user
        ),
      }))
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  },
  
  deleteUser: async (id) => {
    try {
      await userApi.deleteUser(id)
      set((state) => ({
        users: state.users.filter((user) => user._id !== id),
      }))
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  },
}))