import { Video } from '../types'

const API_URL = process.env.API_URL || 'http://localhost:5000/api'
const STORAGE_KEY = 'h2o_mock_videos'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const getLocalVideos = (): Video[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    return []
  }
}

const saveLocalVideos = (videos: Video[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(videos))
}

export const getVideos = async (): Promise<Video[]> => {
  try {
    const response = await fetch(`${API_URL}/videos`)
    if (!response.ok) throw new Error('Network response was not ok')
    return await response.json()
  } catch (error) {
    console.warn('Backend unavailable. Mocking Videos.')
    const local = getLocalVideos()
    if (local.length === 0) {
      // Return some dummy data if empty
      return [
        {
          id: 1,
          title: 'How to clean your dispenser',
          description: 'Maintenance guide for H2O dispensers.',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          date: new Date().toISOString(),
        },
      ]
    }
    return local
  }
}

export const createVideo = async (video: Omit<Video, 'id'>): Promise<Video> => {
  try {
    const response = await fetch(`${API_URL}/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(video),
    })
    if (!response.ok) throw new Error('Failed to create video')
    return await response.json()
  } catch (error) {
    console.warn('Backend unavailable. Mocking Create Video.')
    await delay(500)
    const newVideo = { ...video, id: Date.now() } as Video
    const current = getLocalVideos()
    saveLocalVideos([newVideo, ...current])
    return newVideo
  }
}

export const updateVideo = async (video: Video): Promise<Video> => {
  try {
    const response = await fetch(`${API_URL}/videos/${video.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(video),
    })
    if (!response.ok) throw new Error('Failed to update video')
    return await response.json()
  } catch (error) {
    console.warn('Backend unavailable. Mocking Update Video.')
    await delay(500)
    // const current = getLocalVideos()
    // const updated = current.map((v) => (v.id === video.id ? video : v))
    // saveLocalVideos(updated)
    return video
  }
}

export const deleteVideo = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/videos/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete video')
    return true
  } catch (error) {
    console.warn('Backend unavailable. Mocking Delete Video.')
    await delay(500)
    const current = getLocalVideos()
    saveLocalVideos(current.filter((v) => v.id !== id))
    return true
  }
}
