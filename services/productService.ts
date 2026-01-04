import { Product } from '@prisma/client'
import { AxiosError } from 'axios'
import { ProductList } from '../types'
import { api, handleApiError, ServerErrorResponse } from './apiInstance'

const API_URL = process.env.API_URL || 'http://localhost:5000/api'
const STORAGE_KEY = 'h2o_mock_products'

// Helper to simulate network delay for better UX in mock mode
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// --- Local Storage Helpers ---

// --- API Methods ---

export const getProducts = async (): Promise<ProductList[]> => {
  try {
    const response = await api.get<ProductList[]>('/products')
    return response.data
  } catch (error) {
    return handleApiError(error as AxiosError<ServerErrorResponse>)
  }
}

export const getProductsByBrandCategory = async (
  brand: string,
  category: string
): Promise<ProductList[]> => {
  try {
    const response = await api.get<ProductList[]>(
      `/products/${brand}/${category}`
    )
    return response.data
  } catch (error) {
    return handleApiError(error as AxiosError<ServerErrorResponse>)
  }
}

export const createProduct = async (
  productData: FormData | Omit<Product, 'id'>
): Promise<Product> => {
  try {
    // Determine if we are sending FormData (file upload) or JSON (mock/legacy)
    const isFormData = productData instanceof FormData

    const body = isFormData ? productData : JSON.stringify(productData)
    const response = await api.post<Product>('/products', productData)
    return response.data
  } catch (error) {
    return handleApiError(error as AxiosError<ServerErrorResponse>)
  }
}

export const updateProduct = async (
  productData: FormData | Product
): Promise<Product> => {
  try {
    const isFormData = productData instanceof FormData
    const id = isFormData ? productData.get('id') : (productData as Product).id
    const response = await api.put<Product>(`/products/${id}`, productData)
    return response.data
  } catch (error) {
    return handleApiError(error as AxiosError<ServerErrorResponse>)
  }
}

export const deleteProduct = async (id: number): Promise<boolean> => {
  try {
    await api.delete(`/products/${id}`)
    return true
  } catch (error) {
    return handleApiError(error as AxiosError<ServerErrorResponse>)
  }
}
