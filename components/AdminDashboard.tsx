import {
  AlertTriangle,
  Box,
  ChevronRight,
  Droplets,
  Edit,
  FileText,
  Globe,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Package,
  Phone,
  PlaySquare,
  Plus,
  Save,
  Settings,
  ShoppingCart,
  Tag,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, logout } from '../services/authService'
import {
  createCategory,
  deleteCategory,
  getCategories,
} from '../services/categoryService'
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from '../services/productService'
import { getSettings, saveSettings } from '../services/settingsService'
import {
  createVideo,
  deleteVideo,
  getVideos,
  updateVideo,
} from '../services/videoService'
import {
  Category,
  Product,
  ProductVariant,
  SiteSettings,
  Video,
} from '../types'
import ImageDragDrop from './ImageDragDrop'
import MenuSection from './MenuSection'

interface AdminDashboardProps {
  products: Product[]
  onDataRefresh: () => void
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

  // CRUD State
  const [isEditing, setIsEditing] = useState<Product | null>(null)
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
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDisplayName, setNewCategoryDisplayName] = useState('')
  const [newCategoryBrand, setNewCategoryBrand] = useState<
    'Grown' | 'Diamond' | 'All'
  >('All')
  const [isAddingCategory, setIsAddingCategory] = useState(false)

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({})
  const [formVariants, setFormVariants] = useState<Partial<ProductVariant>[]>(
    []
  )

  // Settings State
  const [settingsData, setSettingsData] = useState<SiteSettings | null>(null)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const base64 = await handleFileUpload(e.dataTransfer.files[0])
      setFormData({ ...formData, image: base64 })
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

  const saveAdminPassword = (newPassword: string) => {
    // Implementation would go here
  }

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || !confirmPassword) return
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match')
      return
    }
    if (newPassword.length < 4) {
      alert('Password too short (min 4 chars)')
      return
    }

    saveAdminPassword(newPassword)
    setNewPassword('')
    setConfirmPassword('')
    alert('Password updated successfully')
  }

  // --- Form Logic ---
  const initForm = (product?: Product) => {
    if (product) {
      setFormData({ ...product })
      setFormVariants(product.variants || [])
      setIsEditing(product)
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: 'plastic',
        brand: 'Grown',
        image: 'https://picsum.photos/400',
        volume: '',
      })
      setFormVariants([{ name: 'Standard', price: 0, stock: 100, image: '' }])
      setIsAdding(true)
    }
  }

  const addVariantRow = () =>
    setFormVariants([
      ...formVariants,
      { name: 'Standard', price: formData.price || 0, stock: 0, image: '' },
    ])

  const removeVariantRow = (index: number) =>
    setFormVariants(formVariants.filter((_, i) => i !== index))

  const updateVariant = (
    index: number,
    field: keyof ProductVariant,
    value: any
  ) => {
    const newVars = [...formVariants]
    newVars[index] = { ...newVars[index], [field]: value }
    setFormVariants(newVars)
  }

  const handleFileUpload = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) return

    let finalPrice = formData.price
    const validPrices = formVariants
      .map((v) => Number(v.price))
      .filter((p) => !isNaN(p) && p > 0)
    if (validPrices.length > 0) finalPrice = Math.min(...validPrices)

    const payload: any = {
      ...formData,
      price: finalPrice,
      variants: formVariants,
    }

    setIsLoadingAction(true)
    try {
      if (isEditing && formData.id) await updateProduct(payload as Product)
      else await createProduct(payload as Omit<Product, 'id'>)
      await onDataRefresh()
      closeModal()
    } catch (e) {
      console.error(e)
      alert('Operation failed')
    } finally {
      setIsLoadingAction(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this product?')) {
      setIsLoadingAction(true)
      try {
        await deleteProduct(id)
        await onDataRefresh()
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
      } else {
        await createVideo(payload as Omit<Video, 'id'>)
      }

      await loadVideos()
      closeModal()
    } catch (e) {
      console.error(e)
      alert('Failed to add video')
    } finally {
      setIsLoadingAction(false)
    }
  }

  // --- Category Logic ---
  const loadCategories = async () => {
    const c = await getCategories()
    setCategories(c)
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return
    setIsLoadingAction(true)
    try {
      await createCategory({
        name: newCategoryName.trim(),
        displayName: newCategoryDisplayName.trim() || newCategoryName.trim(),
        brand: newCategoryBrand,
      })
      await loadCategories()
      setIsAddingCategory(false)
      setNewCategoryName('')
      setNewCategoryBrand('All')
    } catch (e) {
      alert('Failed to add category')
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
      } catch (e) {
        console.error(e)
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
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoadingAction(false)
      }
    }
  }

  const handleSettingsSubmit = (e: React.FormEvent) => {
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
    setTimeout(() => {
      setIsSavingSettings(false)
      alert('Settings saved successfully!')
      onDataRefresh() // To trigger app to reload settings if needed
    }, 500)
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
  }

  // --- Filtering ---
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // --- Computed Stats for Dashboard ---
  const totalStock = products.reduce(
    (acc, p) => acc + (p.variants?.reduce((s, v) => s + v.stock, 0) || 0),
    0
  )

  const lowStockCount = products.filter((p) =>
    p.variants?.some((v) => v.stock < 10)
  ).length
  const totalValue = products.reduce(
    (acc, p) =>
      acc + (p.variants?.reduce((s, v) => s + v.stock * v.price, 0) || 0),
    0
  )

  // Get available categories based on currently selected form brand
  const getAvailableCategories = () => {
    const selectedBrand = formData.brand || 'Grown'
    return categories.filter(
      (c) => c.brand === 'All' || c.brand === selectedBrand
    )
  }

  // If component mounts without user, it will likely be redirected by App.tsx, but good to have fallback
  if (!user) return null

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
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

        <div className="flex-1 overflow-y-auto py-6">
          <MenuSection
            title="Overview"
            items={[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            ]}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <MenuSection
            title="Controller"
            items={[
              { id: 'products', label: 'Products', icon: Box },
              { id: 'categories', label: 'Categories', icon: Tag },
              { id: 'videos', label: 'Video Guides', icon: PlaySquare },
              // { id: 'inventory', label: 'Inventory', icon: Layers }, // Placeholder
              // { id: 'orders', label: 'Transactions', icon: ShoppingCart }, // Placeholder
              { id: 'users', label: 'Users', icon: Users }, // Placeholder
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
              {user.username.charAt(0)}
            </div>
            <span className="font-medium truncate">{user.username}</span>
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
            {/* <div className="relative hidden sm:block">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Quick search..."
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-400 w-64 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div> */}
            {/* <button className="p-2 text-slate-400 hover:text-primary-600 relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button> */}
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
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-slate-800">
                Dashboard Overview
              </h2>

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
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                    <Layers size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">
                      Total Inventory
                    </p>
                    <p className="text-2xl font-bold text-slate-800">
                      {totalStock}{' '}
                      <span className="text-xs font-normal text-slate-400">
                        units
                      </span>
                    </p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                    <ShoppingCart size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">
                      Inventory Value
                    </p>
                    <p className="text-2xl font-bold text-slate-800">
                      ${totalValue.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">
                      Low Stock Alerts
                    </p>
                    <p className="text-2xl font-bold text-slate-800">
                      {lowStockCount}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                  onClick={() => initForm()}
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
                        <th className="px-6 py-4 font-bold">Product Details</th>
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
                        const pStock =
                          product.variants?.reduce((s, v) => s + v.stock, 0) ||
                          0
                        const isLow = product.variants?.some(
                          (v) => v.stock < 10
                        )
                        return (
                          <tr
                            key={product.id}
                            className="hover:bg-slate-50/50 transition group"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                                  <img
                                    src={product.image}
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
                                className={`px-2.5 py-1 rounded-md text-xs font-bold capitalize ${
                                  product.category === 'plastic'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                    : product.category === 'dispensers'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                    : 'bg-orange-50 text-orange-700 border border-orange-100'
                                }`}
                              >
                                {product.brand}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2.5 py-1 rounded-md text-xs font-bold capitalize ${
                                  product.category === 'plastic'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                    : product.category === 'dispensers'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                    : 'bg-orange-50 text-orange-700 border border-orange-100'
                                }`}
                              >
                                {product.category}
                              </span>
                            </td>
                            {/* <td className="px-6 py-4">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                                  {pStock} units
                                  {isLow && (
                                    <AlertTriangle
                                      size={14}
                                      className="text-amber-500"
                                    />
                                  )}
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5 max-w-[100px]">
                                  <div
                                    className={`h-1.5 rounded-full ${
                                      isLow ? 'bg-amber-400' : 'bg-green-500'
                                    }`}
                                    style={{
                                      width: `${Math.min(pStock, 100)}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </td> */}
                            <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-700">
                              ${product.price.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => initForm(product)}
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
                  onClick={() => setIsAddingCategory(true)}
                  className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-200 font-medium active:scale-95"
                >
                  <Plus size={20} /> Add Category
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* List */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                      <tr>
                        <th className="px-6 py-4 font-bold">Name</th>
                        <th className="px-6 py-4 font-bold">Brand Scope</th>
                        <th className="px-6 py-4 text-right font-bold">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-medium text-slate-800">
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
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
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

                {/* Quick Add (Visible on Desktop side-by-side or Modal if adding) */}
                <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <Tag size={32} className="text-primary-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 mb-1">
                    Dynamic Organization
                  </h3>
                  <p className="text-slate-500 text-sm max-w-xs">
                    Create categories specific to a brand (e.g., 'Water Tanks'
                    for Diamond) or general categories for all.
                  </p>
                </div>
              </div>
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

          {/* --- MODAL: CREATE CATEGORY --- */}
          {isAddingCategory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-lg text-slate-800">
                    New Category
                  </h3>
                  <button
                    onClick={() => setIsAddingCategory(false)}
                    className="p-2 hover:bg-slate-200 rounded-full transition"
                  >
                    <X size={20} className="text-slate-500" />
                  </button>
                </div>
                <form onSubmit={handleAddCategory} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Category Name
                    </label>
                    <input
                      required
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="e.g. 5 Gallon Tanks"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Display Name
                    </label>
                    <input
                      required
                      value={newCategoryDisplayName}
                      onChange={(e) =>
                        setNewCategoryDisplayName(e.target.value)
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="e.g. 5 Gallon Tanks"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Brand Scope
                    </label>
                    <select
                      value={newCategoryBrand}
                      onChange={(e) =>
                        setNewCategoryBrand(e.target.value as any)
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                    >
                      <option value="All">All Brands</option>
                      <option value="Grown">Grown Only</option>
                      <option value="Diamond">Diamond Only</option>
                    </select>
                    <p className="text-xs text-slate-400 mt-1">
                      If set to specific brand, this category will only appear
                      when creating products for that brand.
                    </p>
                  </div>
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(false)}
                      className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoadingAction}
                      className="px-4 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 disabled:opacity-70 flex items-center gap-2"
                    >
                      {isLoadingAction ? 'Saving...' : 'Add Category'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* --- SETTINGS VIEW --- */}
          {activeTab === 'settings' && settingsData && (
            <div className="max-w-3xl space-y-6 animate-in fade-in duration-300">
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
                      Go to Google Maps -&gt; Share -&gt; Embed a map. Copy the
                      HTML and paste it here.
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

          {/* --- PLACEHOLDERS --- */}
          {['orders', 'users', 'inventory', 'analytics', 'reports'].includes(
            activeTab
          ) && (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <FileText size={32} className="opacity-50" />
              </div>
              <h3 className="text-lg font-bold text-slate-600">Coming Soon</h3>
              <p className="text-sm max-w-xs text-center mt-2">
                The {activeTab} module is currently under development.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* --- MODAL PRODUCT --- */}
      {(isAdding || isEditing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {isAdding ? 'New Product' : 'Edit Product'}
                </h3>
                <p className="text-sm text-slate-500">
                  Enter product details and variants below.
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Product Name
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Brand
                    </label>
                    <select
                      value={formData.brand || 'Grown'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          brand: e.target.value as any,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                    >
                      <option value="Grown">Grown</option>
                      <option value="Diamond">Diamond</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        required
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            categoryId: e.target.value as any,
                          })
                        }
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                      >
                        <option value="" disabled>
                          Select Category
                        </option>
                        {getAvailableCategories().map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}

                        <p className="text-[10px] text-slate-400 mt-1">
                          Filtering categories for{' '}
                          <strong>{formData.brand}</strong>.
                          {getAvailableCategories().length === 0 &&
                            ' No categories found.'}
                        </p>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">
                        Subtitle
                      </label>
                      <input
                        type="text"
                        value={formData.volume || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, volume: e.target.value })
                        }
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                    ></textarea>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Product Image
                  </label>
                  <ImageDragDrop
                    dragActive={dragActive}
                    formData={formData}
                    setFormData={setFormData}
                    handleDrag={handleDrag}
                    handleDrop={handleDrop}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-800 flex items-center gap-2">
                    <Layers size={18} /> Variants & Stock
                  </h4>
                  {formVariants.length < 1 && (
                    <button
                      type="button"
                      onClick={addVariantRow}
                      className="text-sm font-bold text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Plus size={16} /> Add Variant
                    </button>
                  )}
                </div>
                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-slate-500 font-medium">
                      <tr>
                        <th className="px-4 py-3 text-left w-[30%]">
                          Variant Name
                        </th>
                        <th className="px-4 py-3 text-left w-[15%]">Price</th>
                        {/* <th className="px-4 py-3 text-left w-[20%]">Stock</th>
                        <th className="px-4 py-3 text-left w-[25%]">Image</th> */}
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {formVariants.map((v, i) => (
                        <tr key={i}>
                          <td className="p-2">
                            <input
                              type="text"
                              value={v.name}
                              onChange={(e) =>
                                updateVariant(i, 'name', e.target.value)
                              }
                              readOnly
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-primary-500"
                              placeholder="Size/Type"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={v.price}
                              onChange={(e) =>
                                updateVariant(i, 'price', e.target.value)
                              }
                              className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none focus:border-primary-500"
                            />
                          </td>
                          {/* <td className="p-2">
                            <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                              <button
                                type="button"
                                onClick={() =>
                                  updateVariant(
                                    i,
                                    'stock',
                                    Math.max(0, (Number(v.stock) || 0) - 1)
                                  )
                                }
                                className="px-2 py-1.5 hover:bg-slate-50 border-r border-slate-100"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={v.stock}
                                onChange={(e) =>
                                  updateVariant(
                                    i,
                                    'stock',
                                    Number(e.target.value)
                                  )
                                }
                                className="w-12 text-center outline-none text-xs"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateVariant(
                                    i,
                                    'stock',
                                    (Number(v.stock) || 0) + 1
                                  )
                                }
                                className="px-2 py-1.5 hover:bg-slate-50 border-l border-slate-100"
                              >
                                +
                              </button>
                            </div>
                          </td> */}
                          {/* <td className="p-2 flex gap-1">
                            <input
                              type="text"
                              value={v.image || ''}
                              onChange={(e) =>
                                updateVariant(i, 'image', e.target.value)
                              }
                              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg outline-none text-xs"
                              placeholder="URL"
                            />
                            <label className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer">
                              <Upload size={14} />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const f = e.target.files?.[0]
                                  if (f)
                                    updateVariant(
                                      i,
                                      'image',
                                      await handleFileUpload(f)
                                    )
                                }}
                              />
                            </label>
                          </td> */}
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeVariantRow(i)}
                              className="text-slate-400 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {formVariants.length === 0 && (
                    <div className="p-4 text-center text-slate-400 text-sm italic">
                      No variants added
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-200 flex items-center gap-2"
                >
                  {isLoadingAction ? (
                    <span className="animate-spin">...</span>
                  ) : (
                    <>
                      <Save size={18} /> Save Product
                    </>
                  )}
                </button>
              </div>
            </form>
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
    </div>
  )
}

export default AdminDashboard
