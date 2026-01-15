import { useQuery } from '@tanstack/react-query'
import { Edit, Plus, Save, Trash2, X } from 'lucide-react'
import React, { useState } from 'react'
import { useVideoMutations } from '../../hooks/useVideoMutations'
import { getVideos } from '../../services/videoService'
import { Video } from '../../types'
import { ConfirmModal } from '../ConfirmModal'

export const VideoView = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [deleteData, setDeleteData] = useState<number>(null)

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['videos', 'all-tab'], // Cache key
    queryFn: getVideos,
  })

  const { deleteVideo, isDeleting } = useVideoMutations()

  const handleDelete = () => {
    if (!deleteData) return
    deleteVideo(deleteData)
    setDeleteData(null)
  }

  return (
    <>
      <div className="space-y-6 animate-in fade-in">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Video Guides</h2>
          <button
            onClick={() => {
              setEditingVideo(null)
              setIsModalOpen(true)
            }}
            className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition font-medium"
          >
            <Plus size={20} /> Add Video
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="relative pt-[56.25%] bg-slate-900">
                <iframe
                  src={video.videoUrl}
                  title={video.title}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-800 mb-1">{video.title}</h3>
                <p className="text-sm text-slate-500 mb-4 flex-1 line-clamp-2">
                  {video.description}
                </p>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-xs text-slate-400">
                    {new Date(video.date).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingVideo(video)
                        setIsModalOpen(true)
                      }}
                      className="p-2 text-slate-400 hover:text-primary-600"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      disabled={isDeleting}
                      onClick={() => {
                        setDeleteData(video.id)
                      }}
                      className="p-2 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {videos.length === 0 && (
          <div className="py-20 text-center text-slate-400 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200">
            No video found.
          </div>
        )}
      </div>

      {isModalOpen && (
        <VideoFormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          video={editingVideo}
          onSuccess={() => {}}
        />
      )}

      <ConfirmModal
        isOpen={!!deleteData}
        onClose={() => setDeleteData(null)}
        onConfirm={handleDelete}
        title={`Are you sure ?`}
        message="This action cannot be undone."
        confirmText="Delete"
      />
    </>
  )
}

// Internal Component for Video Modal
const VideoFormModal = ({ isOpen, onClose, video, onSuccess }: any) => {
  const [formData, setFormData] = useState({
    title: video?.title || '',
    description: video?.description || '',
    videoUrl: video?.videoUrl || '',
  })
  const { addVideo, updateVideo, isSaving } = useVideoMutations()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Embed logic
    let embedUrl = formData.videoUrl.trim()
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = embedUrl.match(regExp)
    if (match && match[2].length === 11) {
      embedUrl = `https://www.youtube.com/embed/${match[2]}`
    }

    const payload = {
      ...formData,
      videoUrl: embedUrl,
      date: new Date().toISOString(),
    }
    const options = {
      onSuccess: () => {
        onClose()
      },
    }
    if (video) updateVideo({ ...payload, id: video.id, thumbnail: '' }, options)
    else addVideo({ ...payload, thumbnail: '' }, options)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-bold">{video ? 'Edit' : 'Add'} Video</h3>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              required
              className="w-full px-3 py-2 border rounded-lg"
              value={formData.title}
              autoFocus
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              YouTube URL
            </label>
            <input
              required
              className="w-full px-3 py-2 border rounded-lg"
              value={formData.videoUrl}
              onChange={(e) =>
                setFormData({ ...formData, videoUrl: e.target.value })
              }
              placeholder="https://youtu.be/v3xxUTNCpic?si=BjQes5duHT5-BWzF"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              disabled={isSaving}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg flex items-center gap-2"
            >
              {isSaving ? (
                '...'
              ) : (
                <>
                  <Save size={18} /> Save
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
