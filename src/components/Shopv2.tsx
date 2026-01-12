import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { getCategoryByBrand } from '../services/categoryService'
import { getProductsByBrandCategory } from '../services/productService'

import { ProductList } from '../types'
import Hero from './Hero'
import ProductCard from './ProductCard'
import ProductDetailsModal from './ProductDetailsModal'
import { PriceListView } from './views/PriceListView'

interface ShopProps {
  products: ProductList[] // Initial products (e.g., "All" list)
  isLoading: boolean // Initial loading state
}

const Shop: React.FC<ShopProps> = ({
  products: initialProducts,
  isLoading: initialLoading,
}) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedProduct, setSelectedProduct] = useState<ProductList | null>(
    null
  )

  // 1. Derive Params
  const activeBrand = (searchParams.get('brand') || 'all').toLowerCase()
  const activeCategory = (searchParams.get('category') || 'all').toLowerCase()
  const isFiltering = activeBrand !== 'all'
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  // 2. Query: Categories (Only fetches if brand is selected)
  const { data: categories = [], isLoading: isCatsLoading } = useQuery({
    queryKey: ['categories', activeBrand],
    queryFn: () => getCategoryByBrand(activeBrand),
    enabled: isFiltering, // Don't fetch if brand is 'all'
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  })

  // 3. Query: Products (Only fetches if brand is selected)
  const { data: fetchedProducts, isLoading: isQueryLoading } = useQuery({
    queryKey: ['products', activeBrand, activeCategory],
    queryFn: () => getProductsByBrandCategory(activeBrand, activeCategory),
    enabled: isFiltering,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    placeholderData: (previousData) => previousData, // Keep showing old data while fetching new (smoother UX)
  })

  const visibleProducts = isFiltering ? fetchedProducts || [] : initialProducts
  const isGridLoading = isFiltering ? isQueryLoading : initialLoading

  // Handlers
  const handleCategoryChange = (category: string) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev)
      newParams.set('category', category)
      return newParams
    })
  }

  const handleClearFilters = () => setSearchParams({})

  const getPageTitle = () => {
    if (activeCategory === 'all') {
      return activeBrand === 'all'
        ? 'Featured Products'
        : `All ${
            activeBrand.charAt(0).toUpperCase() + activeBrand.slice(1)
          } Products`
    }
    const cat = categories.find((c) => c.slug === activeCategory)
    return cat?.displayName || cat?.name || activeCategory
  }

  return (
    <>
      {!isFiltering && activeCategory === 'all' && <Hero />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {isFiltering && (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    activeBrand === 'grown'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {activeBrand} Series
                </span>
              )}
            </div>
            <h2 className="text-3xl font-bold text-slate-900">
              {getPageTitle()}
            </h2>
          </div>
          <div className="text-sm text-slate-400 font-medium">
            {isGridLoading
              ? 'Loading...'
              : `Showing ${visibleProducts.length} results`}
          </div>
        </div>

        {/* Category Tabs */}
        {isFiltering && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
            <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              <div className="flex items-center gap-3">
                <CategoryButton
                  isActive={activeCategory === 'all'}
                  onClick={() => handleCategoryChange('all')}
                  label="All Categories"
                />

                {isCatsLoading ? (
                  <div className="flex items-center gap-2 px-4 text-sm text-slate-400">
                    <Loader2 size={14} className="animate-spin" /> Loading...
                  </div>
                ) : (
                  categories.map((cat) => (
                    <CategoryButton
                      key={cat.id}
                      isActive={activeCategory === cat.slug}
                      onClick={() => handleCategoryChange(cat.slug)}
                      label={cat.displayName || cat.name}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Product Grid */}
        {isGridLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 size={48} className="text-primary-600 animate-spin" />
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={setSelectedProduct}
              />
            ))}

            {visibleProducts.length === 0 && (
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
        ) : (
          <PriceListView
            products={visibleProducts} // Use the filtered list so tabs still work!
            onProductClick={setSelectedProduct}
          />
        )}
      </div>

      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={() => setSelectedProduct(null)}
      />
    </>
  )
}

// Reusable Button
const CategoryButton = ({
  isActive,
  onClick,
  label,
}: {
  isActive: boolean
  onClick: () => void
  label: string
}) => (
  <button
    onClick={onClick}
    className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap ${
      isActive
        ? 'bg-slate-900 text-white border-slate-900'
        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
    }`}
  >
    {label}
  </button>
)

export default Shop
