import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from '../services/productService'

export const useProductMutations = () => {
  const queryClient = useQueryClient()

  const onSuccess = (msg: string) => {
    queryClient.invalidateQueries({ queryKey: ['products'] })
    toast.success(msg)
  }

  const onError = (error: any) => {
    toast.error(error.message || 'Operation failed')
  }

  const addMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => onSuccess('Product added successfully!'),
    onError,
  })

  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => onSuccess('Product updated successfully'),
    onError,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => onSuccess('Product delete successfully'),
    onError,
  })

  return {
    addProduct: addMutation.mutate,
    updateProduct: updateMutation.mutate,
    deleteProduct: deleteMutation.mutate,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
