import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import CategoryCard from '../components/CategoryCard'
import { getCategories } from '../services/categoryService'

const ShopCategories = () => {
  const [activeBrand, setActiveBrand] = useState<string>('all')

  // Fetch Categories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
    staleTime: 1000 * 60 * 10,
  })

  // Filter Logic
  const filteredCategories = categories.filter((cat) =>
    activeBrand === 'all'
      ? true
      : (cat.brand || '').toLowerCase() === activeBrand.toLowerCase()
  )

  const brands = [
    // { id: 'all', label: 'All Series' },
    { id: 'grown', label: 'Grown Series' },
    { id: 'diamond', label: 'Diamond Series' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 font-khmer">
            Our Products
          </h1>
          <p className="text-lg text-slate-600">
            Select a category below to browse our premium water filtration
            products and accessories.
          </p>
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 size={40} className="text-primary-600 animate-spin" />
          </div>
        ) : (
          <>
            {filteredCategories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {filteredCategories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                <p className="text-slate-400 text-lg">
                  No categories found for{' '}
                  <span className="font-bold text-slate-600 capitalize">
                    {activeBrand}
                  </span>
                  .
                </p>
              </div>
            )}
          </>
        )}

        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {brands.map((b) => (
            <BrandCard key={b.id} brand={b} />
          ))}
        </div> */}
      </div>
    </div>
  )
}

export default ShopCategories
