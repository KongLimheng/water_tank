import { Category } from '../types'

const API_URL = process.env.API_URL || 'http://localhost:5000/api'
const STORAGE_KEY = 'h2o_mock_categories'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const getLocalCategories = (): Category[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    // Default seed if empty
    if (!stored) {
      const seeds: Category[] = [
        { id: 1, name: 'Plastic', brand: 'All' },
        { id: 2, name: 'Dispensers', brand: 'All' },
        { id: 3, name: 'Accessories', brand: 'All' },
      ]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeds))
      return seeds
    }
    return JSON.parse(stored)
  } catch (e) {
    return []
  }
}

const saveLocalCategories = (cats: Category[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cats))
}

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_URL}/categories`)
    if (!response.ok) throw new Error('Network response was not ok')
    return await response.json()
  } catch (error) {
    console.warn('Backend unavailable. Mocking Categories.')
    return getLocalCategories()
  }
}

export const createCategory = async (
  category: Omit<Category, 'id'>
  // name: string,
  // brand: 'Grown' | 'Diamond' | 'All'
): Promise<Category> => {
  try {
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category),
    })
    if (!response.ok) throw new Error('Failed to create category')
    return await response.json()
  } catch (error) {
    console.warn('Backend unavailable.')
    await delay(500)
    // const newCat = { id: Date.now(), name, brand }
    // const current = getLocalCategories()
    // saveLocalCategories([...current, newCat])
    throw new Error('Backend unavailable.')
  }
}

export const deleteCategory = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete category')
    return true
  } catch (error) {
    console.warn('Backend unavailable. Mocking Delete Category.')
    await delay(500)
    const current = getLocalCategories()
    saveLocalCategories(current.filter((c) => c.id !== id))
    return true
  }
}
