import { Ruler } from 'lucide-react'
import React, { useMemo } from 'react'
import { ProductList } from '../../types'

interface PriceListViewProps {
  products: ProductList[]
  onProductClick: (product: ProductList) => void
}

export const PriceListView: React.FC<PriceListViewProps> = ({
  products,
  onProductClick,
}) => {
  // 1. Group Products by Category
  const groupedProducts = useMemo(() => {
    const groups: Record<string, ProductList[]> = {}

    products.forEach((p) => {
      // Assuming category names like "Vertical - Series A" or just "Series A"
      // We will group by the Category Name
      const key = p.category?.name || 'Uncategorized'
      if (!groups[key]) groups[key] = []
      groups[key].push(p)
    })

    // Sort variants within groups by volume/name (optional logic)
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => a.price - b.price)
    })

    return groups
  }, [products])

  // Helper to determine if a category is "Vertical" or "Horizontal" based on string content
  // You might want to adjust this based on your actual data IDs or naming convention
  const verticalGroups = Object.entries(groupedProducts).filter(
    ([key]) => !key.toLowerCase().includes('horizontal')
  )
  const horizontalGroups = Object.entries(groupedProducts).filter(([key]) =>
    key.toLowerCase().includes('horizontal')
  )

  // Fallback: If no distinction, just show all in one list
  const allGroups =
    verticalGroups.length === 0 && horizontalGroups.length === 0
      ? Object.entries(groupedProducts)
      : null

  return (
    <div className="max-w-7xl mx-auto p-4 bg-slate-200 min-h-screen rounded-xl">
      {/* Header mimics the image header */}
      <div className="text-center mb-8 border-b-4 border-double border-red-600 pb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2 font-khmer">
          តារាងតម្លៃធុងទឹក (Price List)
        </h1>
        <p className="text-red-600 font-bold text-lg">
          Official Factory Price • 01 - 04 - 2025
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 items-start">
        {/* Left Column (Vertical) */}
        <div className="space-y-8">
          {verticalGroups.map(([categoryName, items]) => (
            <PriceTable
              key={categoryName}
              title={categoryName}
              items={items}
              type="vertical"
              onRowClick={onProductClick}
            />
          ))}
        </div>

        {/* Right Column (Horizontal) or remaining items */}
        <div className="space-y-8">
          {(allGroups || horizontalGroups).map(([categoryName, items]) => (
            <PriceTable
              key={categoryName}
              title={categoryName}
              items={items}
              type="horizontal"
              onRowClick={onProductClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// --- Reusable Sub-Component: The Table ---
const PriceTable = ({
  title,
  items,
  type,
  onRowClick,
}: {
  title: string
  items: ProductList[]
  type: 'vertical' | 'horizontal'
  onRowClick: (p: ProductList) => void
}) => {
  // Extract "Series A/B/C" from the full category name for the big red letter
  const seriesLetter =
    title.match(/Series\s+([A-Z])/i)?.[1] || title.charAt(0).toUpperCase()

  return (
    <div className="relative border border-slate-300 rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="bg-slate-50 border-b-2 border-slate-900 grid grid-cols-4 text-center font-bold text-blue-900 py-2 text-xs md:text-sm">
        <div className="col-span-1 py-1">
          Capacity
          <br />
          <span className="text-xs text-slate-500">ចំណុះ</span>
        </div>
        <div className="col-span-1 py-1">
          Model
          <br />
          <span className="text-xs text-slate-500">ម៉ូដែល</span>
        </div>
        <div className="col-span-1 py-1 hidden md:block">
          Dim.
          <br />
          <span className="text-xs text-slate-500">ទំហំ</span>
        </div>
        <div className="col-span-1 py-1 text-red-600">
          Price
          <br />
          <span className="text-xs text-red-400">តម្លៃ</span>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
          <span className="text-[150px] font-black text-red-600/10 transform -rotate-12 select-none">
            {seriesLetter}
          </span>
        </div>

        {/* Rows */}
        <div className="relative z-10 bg-transparent divide-y divide-slate-300">
          {items.length > 0 ? (
            items.map((product, idx) => (
              <div
                key={product.id}
                onClick={() => onRowClick(product)}
                className={`
                grid grid-cols-4 text-center items-center py-2 text-sm font-bold cursor-pointer transition-colors
                ${idx % 2 === 0 ? 'bg-white/80' : 'bg-slate-50/80'}
                hover:bg-blue-50 hover:text-blue-700
              `}
              >
                {/* Capacity / Volume */}
                <div className="col-span-1 text-red-600 font-extrabold">
                  {product.volume || product.name.split(' ')[0]}
                </div>

                {/* Model / Name */}
                <div className="col-span-1 text-slate-700 text-xs">
                  {product.name}
                </div>

                {/* Dimensions (Mocked or from Desc) */}
                <div className="col-span-1 hidden md:flex justify-center text-slate-500 text-xs">
                  <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                    <Ruler size={10} />
                    {/* Parsing logic or placeholder */}
                    {product.description?.slice(0, 10) || '-'}
                  </span>
                </div>

                {/* Price */}
                <div className="col-span-1 text-red-600 text-base font-black">
                  ${product.price}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
              <p className="text-lg">No products found in this category.</p>
              <button className="mt-4 text-primary-600 font-bold hover:underline">
                View All Products
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
