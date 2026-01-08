import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { CheckCircle2, Facebook, Lock, Youtube } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom'

import AdminDashboard from './components/AdminDashboard'
import LoginView from './components/LoginView'
import Navbar from './components/Navbar'
import Shop from './components/Shopv2'
import VideoGallery from './components/VideoGallery'

import { ToastContainer } from 'react-toastify'
import ShopCategories from './pages/ShopCategories'
import ShopProducts from './pages/ShopProducts'
import { getCurrentUser } from './services/authService'
import { getProducts } from './services/productService'
import { DEFAULT_SETTINGS, getSettings } from './services/settingsService'
import { CartItem, SiteSettings } from './types'

// 1. Create the Client instance outside the component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevent re-fetching when clicking between windows
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
    },
  },
})

// 2. Rename your original 'App' to 'AppContent' (The inner logic)
const AppContent: React.FC = () => {
  const location = useLocation()
  const queryClient = useQueryClient() // Access the client for invalidation
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false)

  // Site Settings (Local storage is sync, so useState is fine here, or you could useQuery for this too)
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)

  // 3. REPLACE useEffect/useState with useQuery for Products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', 'all'], // Unique key for this data
    queryFn: getProducts,
  })

  // Load settings on mount
  useEffect(() => {
    setSettings(getSettings())
  }, [])

  // 4. Refactor Refresh Logic
  const handleDataRefresh = async () => {
    // This forces a refetch of the 'products' query everywhere in the app
    await queryClient.invalidateQueries({ queryKey: ['products', 'all'] })
    setSettings(getSettings())
  }

  // Protected Route Component
  const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
    const user = getCurrentUser()
    if (!user) {
      return <Navigate to="/login" replace />
    }
    if (user.role.toLowerCase() !== 'admin') {
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
              <AdminDashboard products={products} />
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
            // Pass the data from useQuery down to Shop
            element={<Shop products={products} isLoading={isLoading} />}
          />
          <Route path="/shop" element={<ShopProducts />} />
          <Route path="/products" element={<ShopCategories />} />
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

// 5. Export the Main App Wrapper that provides the Query Client
const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
    </QueryClientProvider>
  )
}

export default App
