import { Category } from '../types'
import { api } from './apiInstance'

export const createCategory = async (formData: FormData): Promise<Category> => {
  const { data } = await api.post<Category>('/categories', formData)
  return data
}

export const updateCategory = async (formData: FormData): Promise<Category> => {
  // We expect 'id' to be appended to formData
  const id = formData.get('id')
  const { data } = await api.put<Category>(`/categories/${id}`, formData)
  return data
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>('/categories')
  return response.data
}

export const getCategoryByBrand = async (
  brand: string
): Promise<Category[]> => {
  const response = await api.get<Category[]>('/categories', {
    params: { brand },
  })
  return response.data
}

export const deleteCategory = async (id: number): Promise<boolean> => {
  await api.delete(`/categories/${id}`)
  return true
}
