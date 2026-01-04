import {
  Box,
  Droplets,
  Edit,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  PlaySquare,
  Plus,
  Search,
  Settings,
  Tag,
  Trash2,
  X,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify'
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../services/categoryService'
import { deleteProduct } from '../services/productService'
import {
  getAdminPassword,
  getSettings,
  saveAdminPassword,
  saveSettings,
} from '../services/settingsService'
import {
  createVideo,
  deleteVideo,
  getVideos,
  updateVideo,
} from '../services/videoService'
import { Category, Product, SiteSettings, Video } from '../types'

// --- Types for Forms ---

interface ProductFormValues {
  id?: number
  name: string
  description: string
  price: number
  brand: 'Grown' | 'Diamond'
  categoryId: string // Use string for select value
  volume: string
  image?: string // URL string
  variants: { name: string; price: number; stock: number; image?: string }[]
}

interface CategoryFormValues {
  name: string
  displayName: string
  brand: 'Grown' | 'Diamond' | 'All'
}

interface VideoFormValues {
  title: string
  description: string
  videoUrl: string
  thumbnail: string
}

interface SettingsFormValues {
  phone: string
  email: string
  address: string
  mapUrl: string
}

interface PasswordFormValues {
  password: string
  confirmPassword: string
}

interface AdminDashboardProps {
  products: Product[]
  onDataRefresh: () => void
}

// --- SUB-COMPONENTS (MODALS) ---

const CategoryModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  category?: Category | null
  onSuccess: () => void
}> = ({ isOpen, onClose, category, onSuccess }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (category) {
        reset({
          name: category.name,
          displayName: category.displayName,
          brand: category.brand as any,
        })
      } else {
        reset({ name: '', displayName: '', brand: 'All' })
      }
    }
  }, [isOpen, category, reset])

  const onSubmit: SubmitHandler<CategoryFormValues> = async (data) => {
    setIsLoading(true)
    try {
      const displayName = data.displayName || data.name
      if (category) {
        await updateCategory({ ...category, ...data, displayName })
        toast.success('Category updated')
      } else {
        await createCategory(data.name, displayName, data.brand)
        toast.success('Category created')
      }
      onSuccess()
      onClose()
    } catch (e) {
      toast.error('Operation failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800">
            {category ? 'Edit Category' : 'New Category'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              System Name (ID)
            </label>
            <input
              {...register('name', { required: 'System name is required' })}
              disabled={!!category}
              className={`w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none ${
                category ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
              }`}
              placeholder="e.g. water_bottles"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Display Name
            </label>
            <input
              {...register('displayName', {
                required: 'Display name is required',
              })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g. Water Bottles"
            />
            {errors.displayName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.displayName.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Brand Scope
            </label>
            <select
              {...register('brand')}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
            >
              <option value="All">All Brands</option>
              <option value="Grown">Grown Only</option>
              <option value="Diamond">Diamond Only</option>
            </select>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 disabled:opacity-70 flex items-center gap-2"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const VideoModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  video?: Video | null
  onSuccess: () => void
}> = ({ isOpen, onClose, video, onSuccess }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VideoFormValues>()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (video) {
        reset({
          title: video.title,
          description: video.description,
          videoUrl: video.videoUrl,
          thumbnail: video.thumbnail,
        })
      } else {
        reset({ title: '', description: '', videoUrl: '', thumbnail: '' })
      }
    }
  }, [isOpen, video, reset])

  const onSubmit: SubmitHandler<VideoFormValues> = async (data) => {
    setIsLoading(true)
    try {
      let embedUrl = data.videoUrl.trim()
      const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
      const match = embedUrl.match(regExp)
      if (match && match[2].length === 11) {
        embedUrl = `https://www.youtube.com/embed/${match[2]}`
      }

      const payload = {
        ...data,
        videoUrl: embedUrl,
        date: video ? video.date : new Date().toISOString(),
      }

      if (video) {
        await updateVideo({ ...payload, id: video.id })
        toast.success('Video updated')
      } else {
        await createVideo(payload)
        toast.success('Video added')
      }
      onSuccess()
      onClose()
    } catch (e) {
      toast.error('Failed to save video')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800">
            {video ? 'Edit Video' : 'Add Video'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title
            </label>
            <input
              {...register('title', { required: 'Title is required' })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">
                {errors.title.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              YouTube URL
            </label>
            <input
              {...register('videoUrl', { required: 'URL is required' })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
            />
            {errors.videoUrl && (
              <p className="text-red-500 text-xs mt-1">
                {errors.videoUrl.message}
              </p>
            )}
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-200 disabled:opacity-70 flex items-center gap-2"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// --- MAIN COMPONENT ---

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  onDataRefresh,
}) => {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [activeTab, setActiveTab] = useState('products')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Modals State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)

  // Data State
  const [videoList, setVideoList] = useState<Video[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [settingsData, setSettingsData] = useState<SiteSettings | null>(null)

  // Forms for Login and Settings
  const loginForm = useForm<{ password: string }>()
  const settingsForm = useForm<SettingsFormValues>()
  const passwordForm = useForm<PasswordFormValues>()

  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === 'settings') {
        const s = getSettings()
        setSettingsData(s)
        settingsForm.reset(s)
      }
      if (activeTab === 'videos') loadVideos()
      if (activeTab === 'products' || activeTab === 'categories')
        loadCategories()
    }
  }, [isAuthenticated, activeTab])

  const loadVideos = async () => {
    const v = await getVideos()
    setVideoList(v)
  }
  const loadCategories = async () => {
    const c = await getCategories()
    setCategories(c)
  }

  const handleLogin = (data: { password: string }) => {
    if (data.password === getAdminPassword()) {
      setIsAuthenticated(true)
      toast.success('Welcome back!')
    } else {
      toast.error('Invalid password')
    }
  }

  const handleProductDelete = async (id: number) => {
    if (window.confirm('Delete this product?')) {
      await deleteProduct(id)
      onDataRefresh()
      toast.success('Product deleted')
    }
  }

  const handleCategoryDelete = async (id: number) => {
    if (window.confirm('Delete this category?')) {
      await deleteCategory(id)
      loadCategories()
      toast.success('Category deleted')
    }
  }

  const handleVideoDelete = async (id: number) => {
    if (window.confirm('Delete video?')) {
      await deleteVideo(id)
      loadVideos()
      toast.success('Video deleted')
    }
  }

  const handleSettingsSave = (data: SettingsFormValues) => {
    let cleanMapUrl = data.mapUrl
    if (cleanMapUrl.includes('<iframe')) {
      const srcMatch = cleanMapUrl.match(/src="([^"]+)"/)
      if (srcMatch && srcMatch[1]) cleanMapUrl = srcMatch[1]
    }

    // Ensure we have the base object with all required properties (including those not in form like facebookUrl)
    const currentSettings = settingsData || getSettings()

    const final: SiteSettings = {
      ...currentSettings,
      ...data,
      mapUrl: cleanMapUrl,
    }

    saveSettings(final)
    setSettingsData(final)
    toast.success('Settings saved')
    onDataRefresh()
  }

  const handlePasswordUpdate = (data: PasswordFormValues) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (data.password.length < 4) {
      toast.error('Password too short')
      return
    }
    saveAdminPassword(data.password)
    passwordForm.reset()
    toast.success('Password updated')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
              <LayoutDashboard className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Admin Portal</h2>
          </div>
          <form
            onSubmit={loginForm.handleSubmit(handleLogin)}
            className="space-y-4"
          >
            <input
              type="password"
              {...loginForm.register('password', { required: true })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="Enter Password"
            />
            <button
              type="submit"
              className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition shadow-lg"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full text-slate-400 text-sm hover:text-slate-600 py-2"
            >
              Back to Store
            </button>
          </form>
          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </div>
    )
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-slate-200 w-64 flex-shrink-0 flex flex-col transition-all duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-64 absolute z-20 h-full'
        }`}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
            <Droplets className="text-white" size={18} />
          </div>
          <span className="text-lg font-bold text-slate-800 tracking-tight">
            H2O<span className="text-primary-600">Admin</span>
          </span>
        </div>
        <div className="flex-1 overflow-y-auto py-6 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'products', label: 'Products', icon: Box },
            { id: 'categories', label: 'Categories', icon: Tag },
            { id: 'videos', label: 'Video Guides', icon: PlaySquare },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors border-l-4 ${
                activeTab === item.id
                  ? 'bg-primary-50 text-primary-600 border-primary-600'
                  : 'text-slate-600 hover:bg-slate-50 border-transparent'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 px-4 py-2 w-full text-slate-500 hover:bg-slate-50 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={18} /> View Store
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarOpen ? '' : 'ml-0'
        }`}
      >
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-slate-500 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <span className="font-medium text-slate-800 capitalize">
              {activeTab}
            </span>
          </div>
          {activeTab === 'products' && (
            <div className="relative hidden sm:block">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary-400 w-64 transition-all"
              />
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Package size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">
                    Total Products
                  </p>
                  <p className="text-2xl font-bold text-slate-800">
                    {products.length}
                  </p>
                </div>
              </div>
              {/* Add more stats here */}
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Products</h2>
                <button
                  onClick={() => {
                    setEditingProduct(null)
                    setIsProductModalOpen(true)
                  }}
                  className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition shadow-lg"
                >
                  <Plus size={20} /> Add Product
                </button>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-4">Details</th>
                      <th className="px-6 py-4">Brand</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={p.image}
                              className="w-10 h-10 rounded bg-slate-100 object-cover"
                              alt=""
                            />
                            <div>
                              <div className="font-bold text-slate-800">
                                {p.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                {p.volume}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold uppercase">
                            {p.brand}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono">
                          ${p.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setEditingProduct(p)
                              setIsProductModalOpen(true)
                            }}
                            className="p-2 text-slate-400 hover:text-primary-600"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleProductDelete(p.id)}
                            className="p-2 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">
                  Categories
                </h2>
                <button
                  onClick={() => {
                    setEditingCategory(null)
                    setIsCategoryModalOpen(true)
                  }}
                  className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition shadow-lg"
                >
                  <Plus size={20} /> Add Category
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-4">Display Name</th>
                        <th className="px-6 py-4">System ID</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 font-medium">
                            {cat.displayName || cat.name}
                          </td>
                          <td className="px-6 py-4 text-xs font-mono text-slate-400">
                            {cat.name}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => {
                                setEditingCategory(cat)
                                setIsCategoryModalOpen(true)
                              }}
                              className="text-slate-400 hover:text-primary-600 mr-2"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleCategoryDelete(cat.id)}
                              className="text-slate-400 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Videos</h2>
                <button
                  onClick={() => {
                    setEditingVideo(null)
                    setIsVideoModalOpen(true)
                  }}
                  className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition shadow-lg"
                >
                  <Plus size={20} /> Add Video
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {videoList.map((v) => (
                  <div
                    key={v.id}
                    className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                  >
                    <div className="relative pt-[56.25%] bg-slate-900">
                      <iframe
                        src={v.videoUrl}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                      ></iframe>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-slate-800">{v.title}</h3>
                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          onClick={() => {
                            setEditingVideo(v)
                            setIsVideoModalOpen(true)
                          }}
                          className="p-2 text-slate-400 hover:text-primary-600"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleVideoDelete(v.id)}
                          className="p-2 text-slate-400 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl space-y-6">
              <form
                onSubmit={settingsForm.handleSubmit(handleSettingsSave)}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4"
              >
                <h3 className="font-bold text-lg text-slate-800 border-b pb-2">
                  Site Settings
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700">
                      Phone
                    </label>
                    <input
                      {...settingsForm.register('phone')}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700">
                      Email
                    </label>
                    <input
                      {...settingsForm.register('email')}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Address
                  </label>
                  <textarea
                    {...settingsForm.register('address')}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Map URL
                  </label>
                  <input
                    {...settingsForm.register('mapUrl')}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 text-xs"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-700"
                  >
                    Save Settings
                  </button>
                </div>
              </form>

              <form
                onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4"
              >
                <h3 className="font-bold text-lg text-slate-800 border-b pb-2">
                  Change Password
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700">
                      New Password
                    </label>
                    <input
                      type="password"
                      {...passwordForm.register('password')}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700">
                      Confirm
                    </label>
                    <input
                      type="password"
                      {...passwordForm.register('confirmPassword')}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-900"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}
        </main>
      </div>

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        product={editingProduct}
        categories={categories}
        onSuccess={onDataRefresh}
      />
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        category={editingCategory}
        onSuccess={loadCategories}
      />
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        video={editingVideo}
        onSuccess={loadVideos}
      />
    </div>
  )
}

export default AdminDashboard
