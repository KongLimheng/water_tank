import { CheckCircle2, Facebook, Loader2, Lock, Youtube } from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CartItem, Product, ProductVariant, SiteSettings } from '../types'
import CartDrawer from './CartDrawer'
import ChatWidget from './ChatWidget'
import Hero from './Hero'
import Navbar from './Navbar'
import ProductCard from './ProductCard'
import ProductDetailsModal from './ProductDetailsModal'

interface ShopViewProps {
  products: Product[]
  isLoading: boolean
  cart: CartItem[]
  settings: SiteSettings
  onAddToCart: (p: Product, v?: ProductVariant) => void
  onRemoveFromCart: (id: number) => void
  onUpdateQuantity: (id: number, delta: number) => void
  onCheckout: () => void
  showCheckoutSuccess: boolean
}

const ShopView: React.FC<ShopViewProps> = ({
  products,
  isLoading,
  cart,
  settings,
  onAddToCart,
  onRemoveFromCart,
  onUpdateQuantity,
  onCheckout,
  showCheckoutSuccess,
}) => {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [activeBrand, setActiveBrand] = useState<string>('all')
  const [activeVideo, setActiveVideo] = useState<string>('videos')

  // Main Filter Logic
  const filteredProducts = products.filter((p) => {
    const matchBrand = activeBrand === 'all' || p.brand === activeBrand
    const matchCategory =
      activeCategory === 'all' || p.category === activeCategory
    return matchBrand && matchCategory
  })

  const handleAddToCart = (p: Product, v?: ProductVariant) => {
    onAddToCart(p, v)
    setIsCartOpen(true)
  }

  const handleFilterChange = (brand: string, cat: string) => {
    setActiveBrand(brand)
    setActiveCategory(cat)
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary-200 selection:text-primary-900">
      <Navbar
        cartCount={cart.reduce((a, c) => a + c.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        activeCategory={activeCategory}
        activeBrand={activeBrand}
        onFilterChange={handleFilterChange}
        activeVideo={activeVideo}
        // onCategoryChange={setActiveCategory}
      />

      <main>
        {activeBrand === 'all' &&
          activeCategory === 'all' &&
          activeVideo === 'videos' && <Hero />}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {activeBrand !== 'all' && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      activeBrand === 'Grown'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {activeBrand} Series
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-bold text-slate-900">
                {activeCategory === 'all'
                  ? activeBrand === 'all'
                    ? 'Featured Products'
                    : `All ${activeBrand} Products`
                  : activeCategory.charAt(0).toUpperCase() +
                    activeCategory.slice(1)}
              </h2>
              <p className="text-slate-500 mt-2">
                {activeBrand === 'Grown'
                  ? 'Pure hydration for your daily life.'
                  : activeBrand === 'Diamond'
                  ? 'Premium equipment and bulk solutions.'
                  : 'Premium hydration solutions for every need.'}
              </p>
            </div>
            <div className="text-sm text-slate-400 font-medium">
              {isLoading
                ? 'Loading...'
                : `Showing ${filteredProducts.length} results`}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 size={48} className="text-primary-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={(p) => handleAddToCart(p)}
                  onClick={setSelectedProduct}
                />
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-400">
                  <p className="text-lg">No products found in this category.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="bg-white py-20 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="p-6">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Fast Delivery
                </h3>
                <p className="text-slate-500 leading-relaxed">
                  Same-day delivery for orders placed before 2 PM. We bring the
                  water to your doorstep.
                </p>
              </div>
              <div className="p-6">
                <div className="w-16 h-16 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Certified Quality
                </h3>
                <p className="text-slate-500 leading-relaxed">
                  ISO 9001 certified filtration process ensuring every drop is
                  pure and safe.
                </p>
              </div>
              <div className="p-6">
                <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Sustainable
                </h3>
                <p className="text-slate-500 leading-relaxed">
                  We reuse and recycle our 18.9L tanks to minimize plastic waste
                  in our community.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Footer Section */}
        <footer className="bg-[#111111] text-white pt-10 pb-8 font-sans">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Contact Header Section */}
            <div className="mb-8">
              <h3 className="text-xl md:text-2xl font-bold text-fuchsia-400 mb-6 font-serif">
                លោកអ្នកអាចទំនាក់ទំនងយើងតាមរយៈ:
              </h3>

              <div className="space-y-4 text-base md:text-lg">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-cyan-400 min-w-[120px]">
                    ទូរស័ព្ទលេខ:
                  </span>
                  <span className="text-white tracking-wide">
                    {settings.phone}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="font-bold text-cyan-400 min-w-[120px]">
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
                  <span className="font-bold text-cyan-400 min-w-[120px]">
                    អាស័យដ្ឋាន:
                  </span>
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
                  #378Eo, Street 245, Beong Salang, Toul Kork, Phnom Penh
                  Cambodia
                </p>
                <p className="text-slate-500 text-xs md:text-sm font-medium">
                  រក្សាសិទ្ធិគ្រប់យ៉ាង © 2017 H2O Roto Co., Ltd
                </p>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => navigate('/admin')}
                  className="text-slate-700 hover:text-slate-500 flex items-center gap-1 text-xs transition-colors"
                >
                  <Lock size={12} /> Admin
                </button>
              </div>
            </div>
          </div>
        </footer>
      </main>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemove={onRemoveFromCart}
        onUpdateQuantity={onUpdateQuantity}
        onCheckout={onCheckout}
      />

      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, v) => {
          handleAddToCart(p, v)
          setSelectedProduct(null)
        }}
      />

      <ChatWidget />

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

export default ShopView
