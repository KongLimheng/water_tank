import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import { Facebook } from 'lucide-react'
import React from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

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
import { getSettings } from './services/settingsService'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevent re-fetching when clicking between windows
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
    },
  },
})

const AppContent: React.FC = () => {
  const location = useLocation()
  const { data: settings, isLoading: isSettingsLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: getSettings,
    staleTime: 1000 * 60 * 60,
  })

  // 3. REPLACE useEffect/useState with useQuery for Products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', 'all'], // Unique key for this data
    queryFn: getProducts,
  })

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
      <Navbar />

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
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          {/* Contact Header Section */}
          {isSettingsLoading ? (
            <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-8 h-64">
              <div className="space-y-4">
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              </div>
              <div className="bg-slate-200 rounded-lg h-full"></div>
            </div>
          ) : (
            <>
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
                  {settings.facebookUrl && (
                    <a
                      href={settings.facebookUrl}
                      className="bg-[#1877F2] p-2 rounded text-white hover:opacity-90 transition-opacity transform hover:scale-105"
                    >
                      <Facebook
                        size={24}
                        fill="white"
                        className="stroke-none"
                      />
                    </a>
                  )}
                </div>

                <div className="text-center space-y-2">
                  <p className="text-slate-300 font-medium text-sm md:text-base">
                    {settings.address}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </footer>
    </div>
  )
}

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />

      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
    </QueryClientProvider>
  )
}

export default App
