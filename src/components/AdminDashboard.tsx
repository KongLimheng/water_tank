import {
  Box,
  ChevronRight,
  Loader2,
  LogOut,
  Menu,
  PlaySquare,
  Settings,
  Tag,
} from 'lucide-react'
import React, { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '../public/logo.jpg'
import { getCurrentUser, logout } from '../services/authService'
import { ProductList } from '../types'
import MenuSection from './MenuSection'
// import { CategoryView } from './views/CategoryView'
// import { ProductView } from './views/ProductView'
// import { SettingsView } from './views/SettingsView'
// import { VideoView } from './views/VideoView'

const ProductView = lazy(() =>
  import('./views/ProductView').then((module) => ({
    default: module.ProductView,
  }))
)
const CategoryView = lazy(() =>
  import('./views/CategoryView').then((module) => ({
    default: module.CategoryView,
  }))
)
const SettingsView = lazy(() =>
  import('./views/SettingsView').then((module) => ({
    default: module.SettingsView,
  }))
)
const VideoView = lazy(() =>
  import('./views/VideoView').then((module) => ({ default: module.VideoView }))
)

interface AdminDashboardProps {
  products: ProductList[]
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ products }) => {
  const navigate = useNavigate()
  const [user, setUser] = useState(getCurrentUser())

  // Dashboard State
  const [activeTab, setActiveTab] = useState('products')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false) // Mobile: Auto close
      } else {
        setSidebarOpen(true) // Desktop: Auto open
      }
    }

    // Set initial state on mount
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Cleanup listener on unmount
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleNavChange = useCallback((tabId: string) => {
    setActiveTab(tabId)
    if (window.innerWidth < 1024) {
      setSidebarOpen(false)
    }
  }, [])

  const onExit = () => {
    navigate('/')
  }

  const handleLogout = () => {
    logout()
    onExit()
  }

  if (!user) return null

  return (
    <>
      <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
        {/* Sidebar */}

        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-30
            bg-white border-r border-slate-200 w-64 flex-shrink-0 flex flex-col 
            transition-transform duration-300 ease-in-out
            ${
              sidebarOpen
                ? 'translate-x-0'
                : '-translate-x-full lg:hidden lg:w-0'
            }
          `}
        >
          <div className="h-16 flex items-center gap-2 px-6 border-b border-slate-100">
            <div className="size-10">
              <img
                src={Logo}
                className="w-full h-full object-fill rounded-full shadow-2xl"
              />
            </div>
            <h1 className="text-xs font-bold text-slate-900 tracking-tight">
              Fa De Manufacture Co., LTD.
            </h1>
          </div>

          <div className="flex-1 overflow-y-auto py-6">
            <MenuSection
              title="Controller"
              items={[
                { id: 'products', label: 'Products', icon: Box },
                { id: 'categories', label: 'Categories', icon: Tag },
                { id: 'videos', label: 'Video Guides', icon: PlaySquare },
              ]}
              activeTab={activeTab}
              setActiveTab={handleNavChange}
            />

            <MenuSection
              title="Configuration"
              items={[
                { id: 'settings', label: 'Settings', icon: Settings },
                // { id: 'analytics', label: 'Analytics', icon: BarChart3 }, // Placeholder
                // { id: 'reports', label: 'Reports', icon: FileText }, // Placeholder
              ]}
              activeTab={activeTab}
              setActiveTab={handleNavChange}
            />
          </div>

          <div className="p-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 bg-slate-50 rounded-lg">
              <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs uppercase">
                {user.email.charAt(0)}
              </div>
              <span className="font-medium truncate">{user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2 w-full text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile Overlay (Click to close sidebar) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            sidebarOpen ? '' : 'ml-0'
          }`}
        >
          {/* Header */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden"
              >
                <Menu size={20} />
              </button>
              <div className="hidden sm:flex items-center text-sm text-slate-400">
                <span>Admin</span>
                <ChevronRight size={14} className="mx-2" />
                <span className="font-medium text-slate-800 capitalize">
                  {activeTab}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-primary-600"
              >
                <LogOut size={20} />
              </button>
            </div>
          </header>

          {/* Content Body */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-slate-400">
                  <Loader2 className="animate-spin mr-2" /> Loading...
                </div>
              }
            >
              {activeTab === 'products' && <ProductView products={products} />}
              {activeTab === 'categories' && <CategoryView />}
              {activeTab === 'videos' && <VideoView />}
              {activeTab === 'settings' && <SettingsView />}
            </Suspense>
          </main>
        </div>
      </div>
    </>
  )
}

export default AdminDashboard
