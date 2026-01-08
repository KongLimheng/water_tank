import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from '../services/productService'

export const useProductMutations = () => {
  const queryClient = useQueryClient()

  const addMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      console.log('Product added successfully!')
    },
    onError: (error) => {
      console.error('Error adding product:', error)
    },
  })

  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      console.log('Product updated:', data.name)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product delete successfully')
    },
  })

  return {
    addProduct: addMutation.mutate,
    updateProduct: updateMutation.mutate,
    deleteProduct: deleteMutation.mutate,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    addError: addMutation.error,
  }
}
