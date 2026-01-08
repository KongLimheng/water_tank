import { Video } from '../types'
import { api } from './apiInstance'

export const getVideos = async (): Promise<Video[]> => {
  const response = await api.get<Video[]>('/videos')
  return response.data
}

export const createVideo = async (video: Omit<Video, 'id'>): Promise<Video> => {
  const response = await api.post(`/videos`, video)
  return response.data
}

export const updateVideo = async (video: Video): Promise<Video> => {
  const response = await api.put(`/videos/${video.id}`, video)
  return response.data
}

export const deleteVideo = async (id: number): Promise<boolean> => {
  const response = await api.delete(`/videos/${id}`)
  return response.data
}
