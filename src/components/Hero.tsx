import { useEffect, useRef, useState } from 'react'
import { getSettings } from '../services/settingsService'
import { BannerItem } from '../types'
export const Hero: React.FC = () => {
  const [banners, setBanners] = useState<BannerItem[]>([])
  const [loading, setLoading] = useState(true)

  // 1. Fetch Banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const settings = await getSettings()
        // Ensure banners is an array
        const bannerList = (settings.banners as unknown as BannerItem[]) || []
        setBanners(bannerList)
      } catch (err) {
        console.error('Failed to load home banners', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBanners()
  }, [])

  if (loading) return <HomeSkeleton />

  return (
    <div className="flex gap-16 flex-col px-5 mt-4">
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
      { threshold: 0.3 } // Trigger when 20% visible
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
      className={`
        flex flex-col
        transform transition-all duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]
        ${
          isVisible
            ? 'opacity-100 translate-y-0 scale-100 blur-0'
            : 'opacity-0 translate-y-32 scale-95 blur-sm'
        }
           `}
    >
      <div
        key={index}
        className="relative bg-primary-900 overflow-hidden rounded-2xl"
      >
        <img
          src={banner.banner_image}
          alt="Water Bottle Splash"
          className="w-full max-h-[40vh] object-fill shadow-2xl"
        />
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
