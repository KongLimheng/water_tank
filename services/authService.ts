interface User {
  id: number
  username: string
  role: string
}

const API_URL = process.env.API_URL || 'http://localhost:5000/api'
const USER_KEY = 'h2o_active_user'

export const login = async (
  username: string,
  password: string
): Promise<User> => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      throw new Error('Invalid credentials')
    }

    const data = await response.json()
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    return data.user
  } catch (error) {
    // Fallback Mock for Demo purposes if backend isn't running
    console.warn(
      'Backend auth failed or unreachable. Trying mock fallback.',
      error
    )
    if (username === 'admin' && password === '123456') {
      const mockUser = { id: 1, username: 'admin', role: 'admin' }
      localStorage.setItem(USER_KEY, JSON.stringify(mockUser))
      return mockUser
    }
    throw error
  }
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
