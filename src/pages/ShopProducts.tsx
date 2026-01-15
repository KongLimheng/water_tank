import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ProductDetailsModal from '../components/Product/ProductDetailsModal'
import { PriceListView } from '../components/views/PriceListView'
import { getProductsByBrandCategory } from '../services/productService'
import { ProductList } from '../types'

const ShopProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get('category')
  const [selectedProduct, setSelectedProduct] = useState<ProductList | null>(
    null
  )
  const router = useNavigate()

  console.log(searchParams.get('category'))

  const { data: fetchedProducts, isLoading: isQueryLoading } = useQuery({
    queryKey: ['products', 'category', activeCategory],
    queryFn: () => getProductsByBrandCategory(activeCategory),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    placeholderData: (previousData) => previousData,
  })

  const visibleProducts = fetchedProducts || []
  const isGridLoading = isQueryLoading

  const handleClearFilters = () => router('/products')
  return (
    <>
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h2 className="text-3xl font-bold text-slate-900">
            {/* {`All ${
              activeBrand.charAt(0).toUpperCase() + activeBrand.slice(1)
            } ${
              visibleProducts.length ? visibleProducts[0].category.name : ''
            } Products`} */}
          </h2>
          <div className="text-sm text-slate-400 font-medium">
            {`Showing ${visibleProducts.length} results`}
          </div>
        </div>
        {/* Product Grid */}
        {isGridLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 size={48} className="text-primary-600 animate-spin" />
          </div>
        ) : (
          // <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          //   {visibleProducts.map((product) => (
          //     <ProductCard
          //       key={product.id}
          //       product={product}
          //       onClick={setSelectedProduct}
          //     />
          //   ))}

          //   {visibleProducts.length === 0 && (
          //     <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
          //       <p className="text-lg">No products found in this category.</p>
          //       <button
          //         onClick={handleClearFilters}
          //         className="mt-4 text-primary-600 font-bold hover:underline"
          //       >
          //         View All Products
          //       </button>
          //     </div>
          //   )}
          // </div>

          <PriceListView
            products={visibleProducts}
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

export default ShopProducts
