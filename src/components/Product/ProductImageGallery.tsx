import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import '../../styles/image-skeleton.css'

interface ProductImageGalleryProps {
  images: string[]
  name: string
  defaultImage: string
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
  name,
  defaultImage,
}) => {
  const [selectedImage, setSelectedImage] = useState(defaultImage || images[0])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const galleryRef = useRef<HTMLDivElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    const index = images.findIndex((img) => img === selectedImage)
    setSelectedIndex(index !== -1 ? index : 0)
    setImageLoaded(false)
  }, [selectedImage, images])

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullScreenChange)
    return () =>
      document.removeEventListener('fullscreenchange', handleFullScreenChange)
  }, [])

  const handleImageSelect = (img: string, index: number) => {
    setSelectedImage(img)
    setSelectedIndex(index)
    setIsZoomed(false)
  }

  const handlePrevImage = () => {
    const newIndex = selectedIndex === 0 ? images.length - 1 : selectedIndex - 1
    setSelectedImage(images[newIndex] || defaultImage)
    setSelectedIndex(newIndex)
    setIsZoomed(false)
  }

  const handleNextImage = () => {
    const newIndex = selectedIndex === images.length - 1 ? 0 : selectedIndex + 1
    setSelectedImage(images[newIndex] || defaultImage)
    setSelectedIndex(newIndex)
    setIsZoomed(false)
  }

  const handleZoomToggle = () => setIsZoomed(!isZoomed)

  const handleFullScreenToggle = async () => {
    if (!galleryRef.current) return

    if (!isFullScreen) {
      await galleryRef.current.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
    setIsZoomed(false)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setMousePosition({ x, y })
  }

  if (images.length === 0) {
    return (
      <div className="image-wrapper relative bg-gray-50 rounded-2xl p-6 flex items-center justify-center h-[500px]">
        <img
          src={selectedImage}
          alt={name}
          className="object-contain rounded-xl max-h-full"
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div
      ref={galleryRef}
      className={`relative  ${
        isFullScreen ? 'bg-black h-screen w-screen p-4' : ''
      }`}
    >
      <button
        onClick={handleFullScreenToggle}
        className="absolute top-4 right-4 z-10 rounded-full p-2 bg-white bg-opacity-80 shadow-md"
      >
        {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
      </button>

      <div className="flex flex-col md:flex-row gap-6 p-4">
        {/* Thumbnails */}
        <div className="flex md:flex-col gap-3 overflow-auto">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => handleImageSelect(img, index)}
              className={`border-2 rounded-xl p-1 ${
                selectedImage === img ? 'border-indigo-600' : 'border-gray-200'
              }`}
            >
              <img
                src={img}
                alt={`${name} ${index}`}
                className="size-20 object-cover rounded-lg"
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                onError={(e) =>
                  ((e.target as HTMLImageElement).src = selectedImage)
                }
              />
            </button>
          ))}
        </div>

        {/* Main Image */}
        <div
          className="relative image-wrapper flex-1 flex items-center justify-center bg-gray-50 rounded-2xl p-6"
          onMouseMove={handleMouseMove}
          onClick={handleZoomToggle}
          style={{ cursor: isZoomed ? 'zoom-out' : 'zoom-in' }}
        >
          {!imageLoaded && <div className="image-skeleton" />}

          <img
            src={selectedImage}
            alt={name}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            className={`transition-transform duration-300 md:max-h-[500px] max-h-[320px] ${
              isZoomed ? 'scale-150' : 'scale-100'
            } ${imageLoaded ? 'image-loaded' : ''}`}
            style={
              isZoomed
                ? { transformOrigin: `${mousePosition.x}% ${mousePosition.y}%` }
                : {}
            }
            onError={(e) =>
              ((e.target as HTMLImageElement).src = selectedImage)
            }
          />

          {/* Navigation */}
          <button
            onClick={handlePrevImage}
            className="absolute left-2 bg-white rounded-full p-2"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={handleNextImage}
            className="absolute right-2 bg-white rounded-full p-2"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductImageGallery
