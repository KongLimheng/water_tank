import React, { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import AdminDashboard from './components/AdminDashboard'
import LoginView from './components/LoginView'
import ShopView from './components/Shop'
import { getCurrentUser } from './services/authService'
import { getProducts } from './services/productService'
import { DEFAULT_SETTINGS, getSettings } from './services/settingsService'
import { CartItem, Product, ProductVariant, SiteSettings } from './types'

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

const App: React.FC = () => {
  const navigate = useNavigate()
  // Products state
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Cart state
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
    setShowCheckoutSuccess(true)
    setCart([])
    setTimeout(() => setShowCheckoutSuccess(false), 3000)
  }

  const handleDataRefresh = async () => {
    await loadProducts()
    setSettings(getSettings())
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ShopView
            products={products}
            isLoading={isLoading}
            cart={cart}
            settings={settings}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onUpdateQuantity={handleUpdateQuantity}
            onCheckout={handleCheckout}
            showCheckoutSuccess={showCheckoutSuccess}
          />
        }
      />
      <Route path="/login" element={<LoginView />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard
              products={products}
              onDataRefresh={handleDataRefresh}
              onExit={() => navigate('/')}
            />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
