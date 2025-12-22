import { PRODUCTS as INITIAL_PRODUCTS } from '../constants'
import { Product } from '../types'

const API_URL = process.env.API_URL || 'http://localhost:5000/api'
const STORAGE_KEY = 'h2o_mock_products'

// Helper to simulate network delay for better UX in mock mode
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// --- Local Storage Helpers ---

const getLocalProducts = (): Product[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch (e) {
    console.error('Error reading local storage', e)
  }

  // Initialize with default constants if empty
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS))
  return INITIAL_PRODUCTS
}

const saveLocalProducts = (products: Product[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  } catch (e) {
    console.error('Error saving to local storage', e)
  }
}

// --- API Methods ---

export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch(`${API_URL}/products`)
    if (!response.ok) throw new Error('Network response was not ok')
    return await response.json()
  } catch (error) {
    console.warn('Backend unavailable. Switching to Offline/Mock Mode.')
    // return getLocalProducts()
    throw error
  }
}

export const createProduct = async (
  product: Omit<Product, 'id'>
): Promise<Product> => {
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    })
    if (!response.ok) throw new Error('Failed to create product')
    return await response.json()
  } catch (error) {
    console.warn('Backend unavailable. Mocking Create locally.')
    await delay(500)

    const current = getLocalProducts()
    // Generate a temporary ID (backend would normally do this)
    const newProduct = { ...product, id: Date.now() } as Product
    // Add to top of list
    saveLocalProducts([newProduct, ...current])

    return newProduct
  }
}

export const updateProduct = async (product: Product): Promise<Product> => {
  try {
    const response = await fetch(`${API_URL}/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    })
    if (!response.ok) throw new Error('Failed to update product')
    return await response.json()
  } catch (error) {
    console.warn('Backend unavailable. Mocking Update locally.')
    await delay(500)

    const current = getLocalProducts()
    const updated = current.map((p) => (p.id === product.id ? product : p))
    saveLocalProducts(updated)

    return product
  }
}

export const deleteProduct = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete product')
    return true
  } catch (error) {
    console.warn('Backend unavailable. Mocking Delete locally.')
    await delay(500)

    const current = getLocalProducts()
    saveLocalProducts(current.filter((p) => p.id !== id))

    return true
  }
}
