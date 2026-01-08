import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from '../services/categoryService'

export const useCategoryMutations = () => {
  const queryClient = useQueryClient()

  const onSuccess = (msg: string) => {
    queryClient.invalidateQueries({ queryKey: ['categories'] })
    toast.success(msg)
  }

  const onError = (error: any) => {
    toast.error(error.message || 'Operation failed')
  }

  const addMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => onSuccess('Category created successfully'),
    onError,
  })

  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => onSuccess('Category updated successfully'),
    onError,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => onSuccess('Category delete successfully'),
    onError,
  })

  return {
    addCategory: addMutation.mutate,
    updateCategory: updateMutation.mutate,
    deleteCategory: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    isSaving: addMutation.isPending || updateMutation.isPending,
  }
}
