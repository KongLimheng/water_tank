import type { Product } from '@prisma/client'
import { ProductList } from '../types'
import { api } from './apiInstance'

export const getProducts = async (): Promise<ProductList[]> => {
  const { data } = await api.get<ProductList[]>('/products')
  return data
}

export const getProductsByBrandCategory = async (
  brand: string,
  category: string
): Promise<ProductList[]> => {
  const { data } = await api.get<ProductList[]>(
    `/products/${brand}/${category}`
  )
  return data
}

export const createProduct = async (
  productData: FormData | Omit<Product, 'id'>
): Promise<Product> => {
  const { data } = await api.post<Product>('/products', productData)
  return data
}

export const updateProduct = async (
  productData: FormData | Product
): Promise<Product> => {
  const isFormData = productData instanceof FormData
  const id = isFormData ? productData.get('id') : (productData as Product).id

  const { data } = await api.put<Product>(`/products/${id}`, productData)
  return data
}

export const deleteProduct = async (id: number): Promise<boolean> => {
  await api.delete(`/products/${id}`)
  return true
}
