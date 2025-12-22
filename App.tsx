import { CheckCircle2, Facebook, Lock, Youtube } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AdminDashboard from './components/AdminDashboard'
import LoginView from './components/LoginView'
import Navbar from './components/Navbar'
import Shop from './components/Shop'
import VideoGallery from './components/VideoGallery'
import { getCurrentUser } from './services/authService'
import { getProducts } from './services/productService'
import { DEFAULT_SETTINGS, getSettings } from './services/settingsService'
import { CartItem, Product, ProductVariant, SiteSettings } from './types'

const App: React.FC = () => {
  const location = useLocation()
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Products state is now managed via API fetches
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [cart, setCart] = useState<CartItem[]>([])
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false)

  // Site Settings
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)

  // Fetch products on mount
  useEffect(() => {
    loadProducts()
    // Load settings from local storage
    setSettings(getSettings())
  }, [])

  const loadProducts = async () => {
    setIsLoading(true)
    try {
      const data = await getProducts()
      setProducts(data)
    } catch (error) {
      console.error('Failed to load products', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = (product: Product, variant?: ProductVariant) => {
    let itemPrice = product.price
    let itemName = product.name
    let itemImage = product.image

    if (variant) {
      itemPrice = variant.price
      itemName = `${product.name} (${variant.name})`
      if (variant.image) itemImage = variant.image
    }

    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.id === product.id && item.selectedVariantId === variant?.id
      )

      if (existing) {
        return prev.map((item) =>
          item.id === product.id && item.selectedVariantId === variant?.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }

      return [
        ...prev,
        {
          ...product,
          quantity: 1,
          price: itemPrice,
          name: itemName,
          image: itemImage,
          selectedVariantId: variant?.id,
          selectedVariantName: variant?.name,
        },
      ]
    })
    setIsCartOpen(true)
  }

  const handleRemoveFromCart = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const handleUpdateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta
          return newQty > 0 ? { ...item, quantity: newQty } : item
        }
        return item
      })
    )
  }

  const handleCheckout = () => {
    setIsCartOpen(false)
    setShowCheckoutSuccess(true)
    setCart([])
    setTimeout(() => setShowCheckoutSuccess(false), 3000)
  }

  const handleDataRefresh = async () => {
    await loadProducts()
    setSettings(getSettings())
  }

  // Protected Route Component
  const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
    const user = getCurrentUser()

    if (!user) {
      return <Navigate to="/login" replace />
    }

    if (user.role !== 'admin') {
      return <Navigate to="/" replace />
    }

    return children
  }

  // Check if current route is admin to conditionally hide nav/footer
  const isAdminRoute = location.pathname.startsWith('/admin')

  if (isAdminRoute) {
    return (
      <Routes>
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard
                products={products}
                onDataRefresh={handleDataRefresh}
              />
            </ProtectedRoute>
          }
        />
      </Routes>
    )
  }

  const isLogin = location.pathname.startsWith('/login')
  if (isLogin) {
    return (
      <Routes>
        <Route path="/login" element={<LoginView />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary-200 selection:text-primary-900 flex flex-col">
      <Navbar
        cartCount={cart.reduce((a, c) => a + c.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
      />

      <main className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <Shop
                products={products}
                isLoading={isLoading}
                onAddToCart={handleAddToCart}
              />
            }
          />
          <Route path="/videos" element={<VideoGallery />} />
        </Routes>
      </main>

      {/* Custom Footer Section */}
      <footer className="pt-10 pb-8 text-black font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Contact Header Section */}
          <div className="mb-8">
            <h3 className="text-xl md:text-2xl font-bold mb-6 font-khmer">
              លោកអ្នកអាចទំនាក់ទំនងយើងតាមរយៈ៖
            </h3>

            <div className="space-y-4 text-base md:text-lg">
              <div className="flex items-start gap-2">
                <span className="font-bold text-black min-w-[120px]">
                  ទូរស័ព្ទលេខ:
                </span>
                <span className="tracking-wide">{settings.phone}</span>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-bold min-w-[120px]">
                  សារអេឡិចត្រូនិច:
                </span>
                <a
                  href={`mailto:${settings.email}`}
                  className="text-blue-500 hover:text-blue-400 underline decoration-blue-500/50"
                >
                  {settings.email}
                </a>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-bold min-w-[120px]">អាស័យដ្ឋាន:</span>
                <span>{settings.address}</span>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="w-full h-[350px] bg-slate-800 rounded-lg overflow-hidden border border-slate-800 mb-8 relative">
            {/* Using CSS filter to simulate dark mode map styling */}
            <iframe
              src={settings.mapUrl}
              width="100%"
              height="100%"
              style={{
                border: 0,
                filter: 'invert(90%) hue-rotate(180deg) contrast(90%)',
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full"
              title="H2O Location"
            ></iframe>
            <div className="absolute inset-0 bg-blue-900/10 pointer-events-none mix-blend-overlay"></div>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col items-center gap-6 mt-8">
            {/* Social Icons */}
            <div className="flex gap-4">
              <a
                href={settings.facebookUrl}
                className="bg-[#1877F2] p-2 rounded text-white hover:opacity-90 transition-opacity transform hover:scale-105"
              >
                <Facebook size={24} fill="white" className="stroke-none" />
              </a>
              <a
                href={settings.youtubeUrl}
                className="bg-[#FF0000] p-2 rounded text-white hover:opacity-90 transition-opacity transform hover:scale-105"
              >
                <Youtube size={24} fill="white" className="stroke-none" />
              </a>
            </div>

            <div className="text-center space-y-2">
              <p className="text-slate-300 font-medium text-sm md:text-base">
                #378Eo, Street 245, Beong Salang, Toul Kork, Phnom Penh Cambodia
              </p>
              <p className="text-slate-500 text-xs md:text-sm font-medium">
                រក្សាសិទ្ធិគ្រប់យ៉ាង © 2017 H2O Roto Co., Ltd
              </p>
            </div>

            <div className="mt-4">
              <Link
                to="/admin"
                className="text-slate-700 hover:text-slate-500 flex items-center gap-1 text-xs transition-colors"
              >
                <Lock size={12} /> Admin
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemove={handleRemoveFromCart}
        onUpdateQuantity={handleUpdateQuantity}
        onCheckout={handleCheckout}
      /> */}

      {/* <ChatWidget /> */}

      {/* Checkout Success Toast */}
      {showCheckoutSuccess && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-[60] animate-bounce">
          <CheckCircle2 size={24} />
          <div>
            <h4 className="font-bold">Order Placed!</h4>
            <p className="text-sm text-green-100">
              Thank you for choosing H2O Premium.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
