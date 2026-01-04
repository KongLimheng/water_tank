import { Category } from '@prisma/client'
import { AxiosError } from 'axios'
import { api, handleApiError, ServerErrorResponse } from './apiInstance'

const STORAGE_KEY = 'h2o_mock_categories'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get<Category[]>('/categories')
    return response.data
  } catch (error) {
    return handleApiError(error as AxiosError<ServerErrorResponse>)
  }
}

export const createCategory = async (
  category: Omit<Category, 'id' | 'createdAt' | 'slug'>
): Promise<Category> => {
  try {
    const response = await api.post<Category>('/categories', category)
    return response.data
  } catch (error) {
    return handleApiError(error as AxiosError<ServerErrorResponse>)
  }
}

export const updateCategory = async (category: Category): Promise<Category> => {
  try {
    const response = await api.put<Category>(
      `/categories/${category.id}`,
      category
    )
    return response.data
  } catch (error) {
    return handleApiError(error as AxiosError<ServerErrorResponse>)
  }
}

export const getCategoryByBrand = async (
  brand: string
): Promise<Category[]> => {
  try {
    const response = await api.get<Category[]>('/categories', {
      params: { brand },
    })
    return response.data
  } catch (error) {
    return handleApiError(error as AxiosError<ServerErrorResponse>)
  }
}

export const deleteCategory = async (id: number): Promise<boolean> => {
  try {
    await api.delete(`/categories/${id}`)
    return true
  } catch (error) {
    return handleApiError(error as AxiosError<ServerErrorResponse>)
  }
}
