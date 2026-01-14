import { api } from './apiInstance'

export interface Brand {
  id: number
  name: string
  slug: string
  image?: string
}

export const getBrands = async (): Promise<Brand[]> => {
  const { data } = await api.get<Brand[]>('/brands')
  return data
}

export const createBrand = async (formData: Brand) => {
  const { data } = await api.post<Brand>('/brands', formData)
  return data
}

export const updateBrand = async (formData: Brand) => {
  const { data } = await api.put<Brand>(`/brands/${formData.id}`, formData)
  return data
}

export const deleteBrand = async (id: number) => {
  await api.delete(`/brands/${id}`)
}
