import { Category, Variant } from '@prisma/client'
import {
  Box,
  ChevronRight,
  Droplets,
  Edit,
  Globe,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Phone,
  PlaySquare,
  Plus,
  Save,
  Settings,
  Tag,
  Trash2,
  X,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import { getCurrentUser, logout } from '../services/authService'
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../services/categoryService'
import { deleteProduct } from '../services/productService'
import { getSettings, saveSettings } from '../services/settingsService'
import {
  createVideo,
  deleteVideo,
  getVideos,
  updateVideo,
} from '../services/videoService'
import { ProductList, SiteSettings, Video } from '../types'
import { generatePlaceholderImage } from '../utils/placeholderImage'
import { CategoryModal } from './CategoryModel'
import MenuSection from './MenuSection'
import { ProductModal } from './ProductModel'

interface AdminDashboardProps {
  products: ProductList[]
  onDataRefresh: () => Promise<void>
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  onDataRefresh,
}) => {
  const navigate = useNavigate()
  const [user, setUser] = useState(getCurrentUser())

  // Dashboard State
  const [activeTab, setActiveTab] = useState('products')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  // Image Upload State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  // CRUD State
  const [isEditing, setIsEditing] = useState<ProductList | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isLoadingAction, setIsLoadingAction] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dragActive, setDragActive] = useState(false)

  // CRUD State for Videos
  const [videoList, setVideoList] = useState<Video[]>([])
  const [isAddingVideo, setIsAddingVideo] = useState(false)
  const [isEditingVideo, setIsEditingVideo] = useState<Video | null>(null)
  const [videoFormData, setVideoFormData] = useState<Partial<Video>>({})

  // CRUD State for Categories
  const [categories, setCategories] = useState<Category[]>([])
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [isEditingCategory, setIsEditingCategory] = useState<Category | null>(
    null
  )

  // Form State
  const [formData, setFormData] = useState<Partial<ProductList>>({})
  const [formVariants, setFormVariants] = useState<Partial<Variant>[]>([])
  // Modals State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)

  // Settings State
  const [settingsData, setSettingsData] = useState<SiteSettings | null>(null)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [categoryFormData, setCategoryFormData] = useState<Partial<Category>>(
    {}
  )

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files)
      toast.info(`${e.dataTransfer.files.length} image(s) added`)
    }
  }

  const onExit = () => {
    navigate('/')
  }

  const handleLogout = () => {
    logout()
    onExit()
  }

  useEffect(() => {
    if (user && activeTab === 'settings') {
      setSettingsData(getSettings())
    }

    if (activeTab === 'videos') {
      loadVideos()
    }

    if (
      activeTab === 'products' ||
      activeTab === 'categories' ||
      isAdding ||
      isEditing
    ) {
      loadCategories()
    }
  }, [user, activeTab, isAdding, isEditing])

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return
    const newFiles = Array.from(files)
    setSelectedFiles((prev) => [...prev, ...newFiles])

    // Create previews
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f))
    setPreviewUrls((prev) => [...prev, ...newPreviews])
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this product?')) {
      setIsLoadingAction(true)
      try {
        await deleteProduct(id)
        onDataRefresh()
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoadingAction(false)
      }
    }
  }

  // --- Video Logic ---
  const loadVideos = async () => {
    const v = await getVideos()
    setVideoList(v)
  }

  const openEditVideo = (video: Video) => {
    setVideoFormData({
      title: video.title,
      description: video.description,
      videoUrl: video.videoUrl,
      thumbnail: video.thumbnail,
    })
    setIsEditingVideo(video)
    setIsAddingVideo(true)
  }

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!videoFormData.title || !videoFormData.videoUrl) return

    setIsLoadingAction(true)
    try {
      // Robust URL parsing
      let url = videoFormData.videoUrl.trim()
      let embedUrl = url

      // Regex to identify YouTube video ID
      // Matches: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
      const regExp =
        /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
      const match = url.match(regExp)

      if (match && match[2].length === 11) {
        // Reconstruct as standard embed URL
        embedUrl = `https://www.youtube.com/embed/${match[2]}`
      } else {
        // Fallback: If user entered something else, ensure it starts with http/https
        if (!url.startsWith('http')) {
          embedUrl = `https://${url}`
        }
      }

      const payload = {
        title: videoFormData.title,
        description: videoFormData.description || '',
        videoUrl: embedUrl,
        thumbnail: videoFormData.thumbnail || '',
        date: isEditingVideo ? isEditingVideo.date : new Date().toISOString(),
      }

      // await createVideo({
      //   title: videoFormData.title,
      //   description: videoFormData.description || '',
      //   videoUrl: embedUrl,
      //   thumbnail: videoFormData.thumbnail || '',
      //   date: new Date().toISOString(),
      // })

      if (isEditingVideo) {
        await updateVideo({ ...payload, id: isEditingVideo.id } as Video)
        toast.success('Video updated successfully')
      } else {
        await createVideo(payload as Omit<Video, 'id'>)
        toast.success('Video added successfully')
      }

      await loadVideos()
      closeModal()
    } catch (e) {
      console.error(e)
      toast.error('Failed to add video')
    } finally {
      setIsLoadingAction(false)
    }
  }

  // --- Category Logic ---
  const loadCategories = async () => {
    const c = await getCategories()
    setCategories(c)
  }

  // --- Category Logic ---
  const openAddCategory = () => {
    setIsEditingCategory(null)
    setIsCategoryModalOpen(true)
    setCategoryFormData({ brand: 'Grown' })
  }

  const openEditCategory = (cat: Category) => {
    setCategoryFormData({ ...cat })
    setIsEditingCategory(cat)
    setIsCategoryModalOpen(true)
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryFormData.name) return

    setIsLoadingAction(true)
    try {
      const displayName = categoryFormData.displayName || categoryFormData.name

      if (isEditingCategory) {
        await updateCategory({
          ...isEditingCategory,
          // name is NOT updated, it is read only in the sense it is the ID/slug
          displayName: displayName,
          brand: categoryFormData.brand as any,
        })
        toast.success('Category updated successfully')
      } else {
        await createCategory({
          name: categoryFormData.name,
          displayName,
          brand: categoryFormData.brand!,
        })
        toast.success('Category created successfully')
      }

      await loadCategories()
      setIsCategoryModalOpen(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save category')
    } finally {
      setIsLoadingAction(false)
    }
  }

  const handleDeleteCategory = async (id: number) => {
    if (window.confirm('Delete this category?')) {
      setIsLoadingAction(true)
      try {
        await deleteCategory(id)
        await loadCategories()
        toast.success('Category deleted successfully')
      } catch (e) {
        toast.error('Failed to delete category')
      } finally {
        setIsLoadingAction(false)
      }
    }
  }

  const handleDeleteVideo = async (id: number) => {
    if (window.confirm('Delete this video?')) {
      setIsLoadingAction(true)
      try {
        await deleteVideo(id)
        await loadVideos()
        toast.success('Video deleted successfully')
      } catch (e) {
        toast.error('Failed to delete video')
      } finally {
        setIsLoadingAction(false)
      }
    }
  }

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settingsData) return
    setIsSavingSettings(true)

    // Extract src from iframe if user pasted the whole tag
    let cleanMapUrl = settingsData.mapUrl
    if (cleanMapUrl.includes('<iframe')) {
      const srcMatch = cleanMapUrl.match(/src="([^"]+)"/)
      if (srcMatch && srcMatch[1]) {
        cleanMapUrl = srcMatch[1]
      }
    }

    const finalSettings = { ...settingsData, mapUrl: cleanMapUrl }
    saveSettings(finalSettings)
    setSettingsData(finalSettings)

    // Simulate network delay
    setActiveTab('settings')
    setIsSavingSettings(false)
    toast.success('Settings saved successfully!')
    // await onDataRefresh() // To trigger app to reload settings if needed
  }

  // Helper to extract clean URL for preview
  const getPreviewUrl = (input: string) => {
    if (!input) return ''
    if (input.includes('<iframe')) {
      const srcMatch = input.match(/src="([^"]+)"/)
      return srcMatch && srcMatch[1] ? srcMatch[1] : ''
    }
    return input
  }

  const closeModal = () => {
    setIsEditing(null)
    setIsAdding(false)
    setFormData({})
    setFormVariants([])
    setIsAddingVideo(false)
    setIsEditingVideo(null)
    setVideoFormData({})
    setIsCategoryModalOpen(false)
    setCategoryFormData({})
    setPreviewUrls([])
    setSelectedFiles([])
  }

  // --- Filtering ---
  const filteredProducts = products

  // If component mounts without user, it will likely be redirected by App.tsx, but good to have fallback
  if (!user) return null

  return (
    <>
      <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
        {/* Sidebar */}

        <aside
          className={`bg-white border-r border-slate-200 w-64 flex-shrink-0 flex flex-col transition-all duration-300 ${
            sidebarOpen
              ? 'translate-x-0'
              : '-translate-x-64 absolute z-20 h-full'
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

          <div className="flex-1 overflow-y-auto py-6">
            <MenuSection
              title="Controller"
              items={[
                { id: 'products', label: 'Products', icon: Box },
                { id: 'categories', label: 'Categories', icon: Tag },
                { id: 'videos', label: 'Video Guides', icon: PlaySquare },
              ]}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            <MenuSection
              title="Configuration"
              items={[
                { id: 'settings', label: 'Settings', icon: Settings },
                // { id: 'analytics', label: 'Analytics', icon: BarChart3 }, // Placeholder
                // { id: 'reports', label: 'Reports', icon: FileText }, // Placeholder
              ]}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
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
                onClick={() => setSidebarOpen(!sidebarOpen)}
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
            {/* --- DASHBOARD VIEW --- */}
            {/* {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-slate-800">
                Dashboard Overview
              </h2>
            </div>
          )} */}

            {/* --- PRODUCTS VIEW --- */}
            {['products'].includes(activeTab) && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      Product Management
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Manage your catalog, stock levels, and variants.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsEditing(null)
                      setIsProductModalOpen(true)
                    }}
                    className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-200 font-medium active:scale-95"
                  >
                    <Plus size={20} /> Add Product
                  </button>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                        <tr>
                          <th className="px-6 py-4 font-bold">
                            Product Details
                          </th>
                          <th className="px-6 py-4 font-bold">Brand</th>
                          <th className="px-6 py-4 font-bold">Category</th>
                          {/* <th className="px-6 py-4 font-bold">Stock Status</th> */}
                          <th className="px-6 py-4 font-bold">Price</th>
                          <th className="px-6 py-4 text-right font-bold">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredProducts.map((product) => {
                          return (
                            <tr
                              key={product.id}
                              className="hover:bg-slate-50/50 transition group"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                                    <img
                                      src={
                                        product.image.length > 0
                                          ? product.image[0]
                                          : generatePlaceholderImage(
                                              product.name
                                            )
                                      }
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-800 text-sm">
                                      {product.name}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {product.volume || 'Standard'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-2.5 py-1 rounded-md text-xs font-bold capitalize bg-orange-50 text-orange-700 border border-orange-100`}
                                >
                                  {product.category.brand}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-2.5 py-1 rounded-md text-xs font-bold capitalize bg-orange-50 text-orange-700 border border-orange-100
                                  }`}
                                >
                                  {product.category.name}
                                </span>
                              </td>

                              <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-700">
                                ${product.price.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setIsEditing(product)
                                      setIsProductModalOpen(true)
                                    }}
                                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(product.id)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* --- CATEGORIES VIEW --- */}
            {activeTab === 'categories' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      Categories
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Organize products into dynamic categories under specific
                      brands.
                    </p>
                  </div>
                  <button
                    onClick={openAddCategory}
                    className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-200 font-medium active:scale-95"
                  >
                    <Plus size={20} /> Add Category
                  </button>
                </div>

                <div className="grid gap-6">
                  {/* List */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                        <tr>
                          <th className="px-6 py-4 font-bold">Display Name</th>
                          <th className="px-6 py-4 font-bold">Name</th>
                          <th className="px-6 py-4 font-bold">Brand</th>
                          <th className="px-6 py-4 text-right font-bold">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {categories.map((cat) => (
                          <tr key={cat.id} className="hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-medium text-slate-800">
                              {cat.displayName || cat.name}
                            </td>
                            <td className="px-6 py-4 text-xs font-mono text-slate-400">
                              {cat.name}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                                  cat.brand === 'Grown'
                                    ? 'bg-green-100 text-green-700'
                                    : cat.brand === 'Diamond'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {cat.brand}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => openEditCategory(cat)}
                                  className="text-slate-400 hover:text-primary-600"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(cat.id)}
                                  className="text-slate-400 hover:text-red-500"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* --- SETTINGS VIEW --- */}
            {activeTab === 'settings' && settingsData && (
              <div className="w-100 space-y-6 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      Site Settings
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Update contact information and map location.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleSettingsSubmit}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6"
                >
                  {/* Contact Info */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Phone size={20} className="text-primary-600" /> Contact
                      Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={16}
                          />
                          <input
                            type="text"
                            value={settingsData.phone}
                            onChange={(e) =>
                              setSettingsData({
                                ...settingsData,
                                phone: e.target.value,
                              })
                            }
                            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            size={16}
                          />
                          <input
                            type="text"
                            value={settingsData.email}
                            onChange={(e) =>
                              setSettingsData({
                                ...settingsData,
                                email: e.target.value,
                              })
                            }
                            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">
                        Address
                      </label>
                      <div className="relative">
                        <MapPin
                          className="absolute left-3 top-3 text-slate-400"
                          size={16}
                        />
                        <textarea
                          rows={2}
                          value={settingsData.address}
                          onChange={(e) =>
                            setSettingsData({
                              ...settingsData,
                              address: e.target.value,
                            })
                          }
                          className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Map Configuration */}
                  <div className="space-y-4 pt-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Globe size={20} className="text-primary-600" /> Map
                      Location
                    </h3>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">
                        Google Maps Embed URL (or iframe tag)
                      </label>
                      <p className="text-xs text-slate-500 mb-2">
                        Go to Google Maps -&gt; Share -&gt; Embed a map. Copy
                        the HTML and paste it here.
                      </p>
                      <textarea
                        rows={4}
                        value={settingsData.mapUrl}
                        onChange={(e) =>
                          setSettingsData({
                            ...settingsData,
                            mapUrl: e.target.value,
                          })
                        }
                        placeholder='<iframe src="https://www.google.com/maps/embed?..." ...></iframe>'
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-mono text-xs text-slate-600"
                      />
                    </div>

                    {/* Map Preview */}
                    <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                        Live Preview
                      </span>
                      <div className="w-full h-64 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 relative">
                        {settingsData.mapUrl ? (
                          <iframe
                            src={getPreviewUrl(settingsData.mapUrl)}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            title="Map Preview"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                            No map URL provided
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="px-8 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-200 flex items-center gap-2 disabled:opacity-70"
                    >
                      {isSavingSettings ? (
                        <span className="animate-spin">...</span>
                      ) : (
                        <>
                          <Save size={18} /> Save Settings
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* --- VIDEOS VIEW --- */}
            {activeTab === 'videos' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      Video Guides
                    </h2>
                    <p className="text-slate-500 text-sm">
                      Manage tutorial videos and guides.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAddingVideo(true)}
                    className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-200 font-medium active:scale-95"
                  >
                    <Plus size={20} /> Add Video
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videoList.map((video) => (
                    <div
                      key={video.id}
                      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
                    >
                      <div className="relative pt-[56.25%] bg-slate-900 group">
                        <iframe
                          src={video.videoUrl}
                          title={video.title}
                          className="absolute inset-0 w-full h-full pointer-events-none" // pointer-events-none to prevent interaction in admin preview list
                        ></iframe>
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-all"></div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-bold text-slate-800 mb-1">
                          {video.title}
                        </h3>
                        <p className="text-sm text-slate-500 mb-4 flex-1 line-clamp-2">
                          {video.description}
                        </p>
                        <div className="flex justify-between items-center mt-auto">
                          <span className="text-xs text-slate-400">
                            {new Date(video.date).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditVideo(video)}
                              className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteVideo(video.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- MODAL: CREATE VIDEO --- */}
            {isAddingVideo && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-bold text-lg text-slate-800">
                      Add New Video
                    </h3>
                    <button
                      onClick={() => setIsAddingVideo(false)}
                      className="p-2 hover:bg-slate-200 rounded-full transition"
                    >
                      <X size={20} className="text-slate-500" />
                    </button>
                  </div>
                  <form onSubmit={handleVideoSubmit} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Video Title
                      </label>
                      <input
                        required
                        value={videoFormData.title || ''}
                        onChange={(e) =>
                          setVideoFormData({
                            ...videoFormData,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="e.g. Maintenance Guide"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value={videoFormData.description || ''}
                        onChange={(e) =>
                          setVideoFormData({
                            ...videoFormData,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                        placeholder="What is this video about?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        YouTube URL
                      </label>
                      <input
                        required
                        type="text"
                        value={videoFormData.videoUrl || ''}
                        onChange={(e) =>
                          setVideoFormData({
                            ...videoFormData,
                            videoUrl: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        Accepts YouTube 'watch' links or direct embed links.
                      </p>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoadingAction}
                        className="px-6 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-200 disabled:opacity-70 flex items-center gap-2"
                      >
                        {isLoadingAction ? (
                          <span className="animate-spin">...</span>
                        ) : (
                          <>
                            <Save size={18} />{' '}
                            {isEditingVideo ? 'Save Changes' : 'Add Video'}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>

        <ProductModal
          isOpen={isProductModalOpen}
          product={isEditing}
          onClose={() => setIsProductModalOpen(false)}
          categories={categories}
          onSuccess={onDataRefresh}
        />

        {/* <ProductModalV2
          isOpen={isProductModalOpen}
          product={isEditing}
          onClose={() => setIsProductModalOpen(false)}
          categories={categories}
          onSuccess={onDataRefresh}
        /> */}

        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          category={isEditingCategory}
          onSuccess={loadCategories}
        />
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        hideProgressBar
      />
    </>
  )
}

export default AdminDashboard
