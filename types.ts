export interface ProductVariant {
  id?: number
  name: string // e.g., "500L Type A"
  price: number
  stock: number
  sku?: string
  image?: string
}

export interface Category {
  id: number
  name: string
  displayName?: string
  brand: 'Grown' | 'Diamond' | 'All' // Categories can be specific to a brand or general
}

export interface Product {
  id: number
  name: string
  description: string
  price: number // Base display price
  image: string
  category: string
  categoryId?: number // Foreign Key for relation
  brand: 'Grown' | 'Diamond'
  volume?: string
  variants?: ProductVariant[]
}

export interface CartItem extends Product {
  quantity: number
  selectedVariantId?: number
  selectedVariantName?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'model'
  text: string
  timestamp: Date
}

export interface Review {
  id: string
  productId: number
  author: string
  rating: number
  text: string
  date: string
}

export interface SiteSettings {
  phone: string
  email: string
  address: string
  mapUrl: string // The src attribute of the iframe
  facebookUrl: string
  youtubeUrl: string
}

export interface Video {
  id: number
  title: string
  description: string
  videoUrl: string // Embed URL (e.g. YouTube embed)
  thumbnail?: string
  date: string
}
