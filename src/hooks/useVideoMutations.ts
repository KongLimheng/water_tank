import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { createVideo, deleteVideo, updateVideo } from '../services/videoService'

export const useVideoMutations = () => {
  const queryClient = useQueryClient()

  const onSuccess = (msg: string) => {
    queryClient.invalidateQueries({ queryKey: ['videos'] })
    toast.success(msg)
  }

  const onError = (error: any) => {
    toast.error(error.message || 'Operation failed')
  }

  const addMutation = useMutation({
    mutationFn: createVideo,
    onSuccess: () => onSuccess('Videos created successfully'),
    onError,
  })

  const updateMutation = useMutation({
    mutationFn: updateVideo,
    onSuccess: () => onSuccess('Videos updated successfully'),
    onError,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteVideo,
    onSuccess: () => onSuccess('Videos delete successfully'),
    onError,
  })

  return {
    addVideo: addMutation.mutate,
    updateVideo: updateMutation.mutate,
    deleteVideo: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    isSaving: addMutation.isPending || updateMutation.isPending,
  }
}
