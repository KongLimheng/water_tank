import { api } from './apiInstance'

interface User {
  id: number
  username: string
  role: string
  email: string
}

const USER_KEY = 'h2o_active_user'

export const login = async (username: string, password: string) => {
  const response = await api.post(`/login`, { username, password })
  localStorage.setItem(USER_KEY, JSON.stringify(response.data.user))
  return response.data.user
}

export const logout = (): void => {
  localStorage.removeItem(USER_KEY)
}

export const getCurrentUser = (): User | null => {
  try {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (e) {
    return null
  }
}

export const isAuthenticated = (): boolean => {
  return !!getCurrentUser()
}
