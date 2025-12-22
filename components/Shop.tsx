import { Loader2 } from 'lucide-react'
import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Product, ProductVariant } from '../types'
import Hero from './Hero'
import ProductCard from './ProductCard'
import ProductDetailsModal from './ProductDetailsModal'

interface ShopProps {
  products: Product[]
  isLoading: boolean
  onAddToCart: (product: Product, variant?: ProductVariant) => void
}

const Shop: React.FC<ShopProps> = ({ products, isLoading, onAddToCart }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const brandParam = searchParams.get('brand') || 'all'
  const categoryParam = searchParams.get('category') || 'all'

  const filteredProducts = products.filter((p) => {
    const matchBrand = brandParam === 'all' || p.brand === brandParam
    const matchCategory =
      categoryParam === 'all' || p.category === categoryParam
    return matchBrand && matchCategory
  })

  const handleClearFilters = () => {
    setSearchParams({})
  }

  return (
    <>
      {/* Show Hero only when no specific filters are applied */}
      {brandParam === 'all' && categoryParam === 'all' && <Hero />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {brandParam !== 'all' && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    brandParam === 'Grown'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {brandParam} Series
                </span>
              )}
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              {categoryParam === 'all'
                ? brandParam === 'all'
                  ? 'Featured Products'
                  : `All ${brandParam} Products`
                : categoryParam.charAt(0).toUpperCase() +
                  categoryParam.slice(1)}
            </h2>
            <p className="text-slate-500 mt-2">
              {brandParam === 'Grown'
                ? 'Pure hydration for your daily life.'
                : brandParam === 'Diamond'
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
                onAdd={(p) => onAddToCart(p)}
                onClick={setSelectedProduct}
              />
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                <p className="text-lg">No products found in this category.</p>
                <button
                  onClick={handleClearFilters}
                  className="mt-4 text-primary-600 font-bold hover:underline"
                >
                  View All Products
                </button>
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

      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p, v) => {
          onAddToCart(p, v)
          setSelectedProduct(null)
        }}
      />
    </>
  )
}

export default Shop
