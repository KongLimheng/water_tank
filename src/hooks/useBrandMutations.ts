import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { createBrand, deleteBrand, updateBrand } from '../services/brandService'

export const useBrandMutations = () => {
  const queryClient = useQueryClient()

  const onSuccess = (msg: string) => {
    queryClient.invalidateQueries({ queryKey: ['brands'] })
    toast.success(msg)
  }

  const onError = (e: any) => toast.error(e.message || 'Operation failed')

  return {
    addBrand: useMutation({
      mutationFn: createBrand,
      onSuccess: () => onSuccess('Brand created!'),
      onError,
    }).mutate,
    updateBrand: useMutation({
      mutationFn: updateBrand,
      onSuccess: () => onSuccess('Brand updated!'),
      onError,
    }).mutate,
    deleteBrand: useMutation({
      mutationFn: deleteBrand,
      onSuccess: () => onSuccess('Brand deleted!'),
      onError,
    }).mutate,
  }
}
