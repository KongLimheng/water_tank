import { Category } from '@prisma/client'
import { Loader2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getCategoryByBrand } from '../services/categoryService'
import { getProductsByBrandCategory } from '../services/productService'
import { ProductList } from '../types'
import Hero from './Hero'
import ProductCard from './ProductCard'
import ProductDetailsModal from './ProductDetailsModal'

interface ShopProps {
  products: ProductList[]
  isLoading: boolean
  // onAddToCart: (product: Product, variant?: ProductVariant) => void
}

const Shop: React.FC<ShopProps> = ({ products, isLoading }) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedProduct, setSelectedProduct] = useState<ProductList | null>(
    null
  )
  const [isCatsLoading, setIsCatsLoading] = useState(true)

  const [categories, setCategories] = useState<Category[]>([])
  const brandParam = searchParams.get('brand')?.toLowerCase() || 'all'
  const categoryParam = searchParams.get('category')?.toLowerCase() || 'all'

  const activeBrand = searchParams.get('brand')?.toLocaleLowerCase() || 'all'
  const activeCategory =
    searchParams.get('category')?.toLocaleLowerCase() || 'all'

  const [productFilter, setProductFilter] = useState<ProductList[] | null>(null)

  const handleCategoryChange = (category: string) => {
    setSearchParams({ brand: activeBrand, category })
  }

  // Filter Categories based on selected Brand
  const availableCategories = categories

  const filteredProducts =
    activeBrand === 'all' && categoryParam === 'all'
      ? products
      : productFilter || []

  const handleClearFilters = () => {
    setSearchParams({})
  }

  // Load categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const data = await getCategoryByBrand(activeBrand)

        setCategories(data)
      } catch (e) {
        console.error(e)
      } finally {
        setIsCatsLoading(false)
      }
    }
    if (activeBrand !== 'all') fetchCats()
  }, [activeBrand])

  useEffect(() => {
    const fetchProFilter = async () => {
      const data = await getProductsByBrandCategory(brandParam, categoryParam)
      setProductFilter(data)
    }
    // Reset selected product when filters change
    if (activeBrand !== 'all') fetchProFilter()
  }, [activeBrand, activeCategory])

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
                    brandParam === 'grown'
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
                  : `All ${
                      brandParam.charAt(0).toUpperCase() + brandParam.slice(1)
                    } Products`
                : availableCategories.find((c) => c.slug === activeCategory)
                    ?.displayName ||
                  availableCategories.find((c) => c.slug === activeCategory)
                    ?.name}
            </h2>
          </div>
          <div className="text-sm text-slate-400 font-medium">
            {isLoading
              ? 'Loading...'
              : `Showing ${filteredProducts.length} results`}
          </div>
        </div>

        {/* --- CATEGORY TABS --- */}
        {activeBrand !== 'all' && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
            <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    activeCategory === 'all'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  All Categories
                </button>
                {isCatsLoading ? (
                  <div className="px-4 py-2 text-sm text-slate-400 flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Loading...
                  </div>
                ) : (
                  availableCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap ${
                        activeCategory === cat.slug
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {cat.displayName || cat.name}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="text-sm text-slate-400 font-medium whitespace-nowrap flex-shrink-0">
              {isLoading
                ? 'Updating...'
                : `${filteredProducts.length} Products`}
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 size={48} className="text-primary-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
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
          setSelectedProduct(null)
        }}
      />
    </>
  )
}

export default Shop
