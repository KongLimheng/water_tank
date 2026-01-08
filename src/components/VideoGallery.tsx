import { useQuery } from '@tanstack/react-query'
import { Calendar, Loader2, PlayCircle } from 'lucide-react'
import React from 'react'
import { getVideos } from '../services/videoService'

const VideoGallery: React.FC = () => {
  const { data: videos = [], isLoading: isVideosLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: getVideos,
    staleTime: 1000 * 60,
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-200">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-slate-900">Video Guides</h2>
        <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
          Helpful tutorials, product demonstrations, and maintenance tips to get
          the most out of your H2O Premium experience.
        </p>
      </div>

      {isVideosLoading ? (
        <div className="flex justify-center h-64 items-center">
          <Loader2 className="animate-spin text-primary-600" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {videos.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-slate-500">
                No videos available at the moment.
              </p>
            </div>
          ) : (
            videos.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-slate-100 flex flex-col h-full"
              >
                {/* Video Container - Aspect Ratio 16:9 */}
                <div className="relative pt-[56.25%] bg-slate-900 group">
                  {video.videoUrl ? (
                    <iframe
                      src={video.videoUrl}
                      title={video.title}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/50">
                      <PlayCircle size={48} />
                    </div>
                  )}
                </div>

                <div className="p-3 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                    <Calendar size={12} />
                    <span>{new Date(video.date).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-slate-600 text-sm line-clamp-3 mb-4 flex-1">
                    {video.description}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default VideoGallery
