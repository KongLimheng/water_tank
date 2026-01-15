import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { getSettings } from '../services/settingsService'
import { BannerItem } from '../types'
export const Hero: React.FC = () => {
  const [banners, setBanners] = useState<BannerItem[]>([])
  const [loading, setLoading] = useState(true)

  const { data: settings, isLoading: isSettingsLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: getSettings,
    staleTime: 1000 * 60 * 60,
  })
  // 1. Fetch Banners
  useEffect(() => {
    try {
      // Ensure banners is an array
      const bannerList = (settings.banners as unknown as BannerItem[]) || []
      setBanners(bannerList)
    } catch (err) {
      console.error('Failed to load home banners', err)
    } finally {
      setLoading(false)
    }
  }, [settings])

  if (loading) return <HomeSkeleton />

  return (
    <div className="flex gap-16 flex-col px-10 xl:px-40 mt-4">
      {banners.map((banner, index) => (
        <ScrollRevealRow banner={banner} index={index} />
        // <div key={index} className="relative bg-primary-900 overflow-hidden">
        //   {/* Abstract Background Shapes */}
        //   <img
        //     src={banner.banner_image} // Generic nature/water image
        //     alt="Water Bottle Splash"
        //     className="w-full max-h-96 object-fill shadow-2xl"
        //   />
        // </div>
      ))}
    </div>
  )
}

const ScrollRevealRow = ({
  banner,
  index,
}: {
  banner: BannerItem
  index: number
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect() // Run once
        }
      },
      { threshold: 0.15 } // Trigger when 20% visible
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const waveDelay = (index % 4) * 150 // 0ms, 150ms, 300ms, 450ms...
  return (
    <div
      ref={ref}
      // Apply the delay inline. Only apply it when becoming visible.
      style={{ transitionDelay: isVisible ? `${waveDelay}ms` : '0ms' }}
      className={`flex flex-col gap-4
        transform transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]
        ${
          isVisible
            ? 'opacity-100 translate-y-0 scale-100 blur-0'
            : 'opacity-0 translate-y-32 scale-95 blur-sm'
        }
           `}
    >
      <div className="group relative w-full h-[30vh] md:h-[50vh] xl:h-[60vh] rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-primary-500/20">
        {/* Image with Zoom Effect */}
        <img
          src={banner.banner_image}
          alt={banner.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 p-8 w-full">
          <h1 className="text-2xl md:text-4xl xl:text-6xl font-bold text-primary-600 leading-tight">
            {banner.name}
          </h1>
        </div>
      </div>
    </div>
  )
}

const HomeSkeleton = () => (
  <div className="space-y-8 p-4">
    <div className="w-full h-[60vh] bg-slate-200 animate-pulse rounded-3xl" />
    <div className="max-w-7xl mx-auto space-y-20 py-20">
      {[1, 2].map((i) => (
        <div key={i} className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-full md:w-1/2 h-80 bg-slate-200 animate-pulse rounded-3xl" />
          <div className="w-full md:w-1/2 space-y-4">
            <div className="h-8 bg-slate-200 w-3/4 rounded-xl animate-pulse" />
            <div className="h-4 bg-slate-200 w-full rounded-xl animate-pulse" />
            <div className="h-4 bg-slate-200 w-2/3 rounded-xl animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  </div>
)
