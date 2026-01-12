import { Package } from 'lucide-react'
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
  // 1. Grouping Logic
  const groupedData = useMemo(() => {
    // Structure to hold our specific groups
    const groups: Record<
      string,
      { vertical: ProductList[]; horizontal: ProductList[] }
    > = {
      A: { vertical: [], horizontal: [] },
      B: { vertical: [], horizontal: [] },
      C: { vertical: [], horizontal: [] },
      OTHER: { vertical: [], horizontal: [] },
    }

    products.forEach((p) => {
      // 1. Determine Group Key (A, B, C, or OTHER)
      let typeKey = p.group ? p.group.trim().toUpperCase() : 'OTHER'
      if (!['A', 'B', 'C'].includes(typeKey)) {
        typeKey = 'OTHER'
      }

      // 2. Determine Orientation (Vertical vs Horizontal)
      // Heuristic: Check category name for "horizontal"
      const isHorizontal = p.type?.toLowerCase().includes('horizontal')

      // 3. Push to correct array
      if (isHorizontal) {
        groups[typeKey].horizontal.push(p)
      } else {
        groups[typeKey].vertical.push(p)
      }
    })

    // 4. Sort by Price
    Object.values(groups).forEach((group) => {
      group.vertical.sort((a, b) => a.price - b.price)
      group.horizontal.sort((a, b) => a.price - b.price)
    })

    return groups
  }, [products])

  // Helper to render sections only if they have data
  const renderSection = (type: string, isOther = false) => {
    const group = groupedData[type]
    const hasData = group.vertical.length > 0 || group.horizontal.length > 0
    if (!hasData) return null

    return (
      <div
        key={type}
        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
      >
        {/* Mobile Header (Visible only on small screens) */}
        <div className="lg:hidden text-center mb-4">
          <span
            className={`inline-block px-8 py-2 text-white text-2xl font-black rounded-xl shadow-lg ${
              isOther ? 'bg-slate-500' : 'bg-red-600'
            }`}
          >
            {isOther ? 'General Products' : `TYPE ${type}`}
          </span>
        </div>

        {/* Desktop Layout: [Vertical Table] - [Center Letter] - [Horizontal Table] */}
        <div className="flex flex-col lg:flex-row items-stretch gap-4">
          {/* Left: Vertical Table */}
          <div className="flex-1 w-full">
            <PriceTable
              items={group.vertical}
              title="Vertical Tanks"
              subtitle="立式水塔"
              onRowClick={onProductClick}
              isHorizontal={false}
            />
          </div>

          {/* Center: The Identifier (Letter or Icon) */}
          <div className="hidden lg:flex flex-col justify-center items-center w-24 xl:w-32 shrink-0 select-none">
            {isOther ? (
              <div className="flex flex-col items-center text-slate-300">
                <Package size={64} />
                <span className="font-bold text-slate-400">OTHER</span>
              </div>
            ) : (
              <span className="text-[110px] font-black text-red-600 leading-none drop-shadow-lg transform scale-y-110">
                {type}
              </span>
            )}
          </div>

          {/* Right: Horizontal Table */}
          <div className="flex-1 w-full min-w-0">
            <PriceTable
              items={group.horizontal}
              title="Horizontal Tanks"
              subtitle="卧式水塔"
              onRowClick={onProductClick}
              isHorizontal={true}
            />
          </div>
        </div>

        {/* Divider between sections */}
        <div className="my-12 border-b border-slate-200"></div>
      </div>
    )
  }

  return (
    <div className="max-w-full rounded-lg mx-auto p-2 md:p-8 bg-slate-200/30 min-h-screen font-sans">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-2xl md:text-5xl font-bold text-blue-900 mb-4 font-khmer tracking-tight">
          តារាងតម្លៃធុងទឹក (Price List)
        </h1>
        <div className="flex flex-col items-center gap-1">
          <div className="h-1.5 w-64 bg-red-600"></div>
          <div className="h-0.5 w-48 bg-red-600"></div>
        </div>
        <p className="mt-4 text-red-600 font-bold text-sm md:text-xl uppercase tracking-widest">
          Official Factory Price • 01 - 04 - 2025
        </p>
      </div>

      {/* Content Area */}
      <div className="space-y-4">
        {renderSection('A')}
        {renderSection('B')}
        {renderSection('C')}
        {renderSection('OTHER', true)}

        {products.length === 0 && (
          <div className="py-20 text-center text-slate-400 bg-slate-50 rounded-xl border-dashed border-2 border-slate-200">
            No products found.
          </div>
        )}
      </div>
    </div>
  )
}

// --- Reusable Table Component ---
const PriceTable = ({
  items,
  title,
  subtitle,
  onRowClick,
  isHorizontal,
}: {
  items: ProductList[]
  title: string
  subtitle: string
  onRowClick: (p: ProductList) => void
  isHorizontal: boolean
}) => {
  // If list is empty, render a placeholder to keep layout balanced?
  // Or return null? The image shows empty space if missing, but let's return null for cleaner UI.
  if (items.length === 0) {
    return (
      <div className="h-full min-h-[200px] border-2 border-dashed border-slate-100 rounded-lg flex items-center justify-center text-slate-300 text-sm">
        No {title} Available
      </div>
    )
  }

  return (
    <div className="border border-slate-400 h-full flex flex-col relative">
      {/* Table Header */}
      <div
        className={`grid ${
          isHorizontal ? 'grid-cols-5' : 'grid-cols-4'
        } text-center font-bold border-b-2 border-slate-400 bg-slate-50`}
      >
        {/* Col 1: Capacity */}
        <div className="py-2 px-1 border-r border-slate-300">
          <div className="text-blue-900 text-sm lg:text-base">ចំណុះ</div>
        </div>

        {/* Col 2: Diameter */}
        <div className="py-2 px-1 border-r border-slate-300">
          <div className="text-blue-900 text-sm lg:text-base">ទទឹងមាត់</div>
        </div>

        {/* Col 3: Length (Only for Horizontal) */}
        {isHorizontal && (
          <div className="py-2 px-1 border-r border-slate-300">
            <div className="text-blue-900 text-sm lg:text-base">បណ្ដោយ</div>
          </div>
        )}

        {/* Col 4: Height */}
        <div className="py-2 px-1 border-r border-slate-300">
          <div className="text-blue-900 text-sm lg:text-base">កំពស់</div>
        </div>

        {/* Col 5: Price */}
        <div className="py-2 px-1">
          <div className="text-blue-900 text-sm lg:text-base">តម្លៃលក់</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="bg-white divide-y divide-slate-400 flex-1">
        {items.map((product, idx) => (
          <div
            key={product.id}
            onClick={() => onRowClick(product)}
            className={`
              grid ${isHorizontal ? 'grid-cols-5' : 'grid-cols-4'} 
              text-center items-center py-2 cursor-pointer transition-colors group
              ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
              hover:bg-blue-50
            `}
          >
            {/* 1. Capacity */}
            <div className="text-red-600 font-black text-sm lg:text-lg border-r border-transparent px-1">
              {product.volume || product.name}
            </div>

            {/* 2. Diameter */}
            <div className="text-red-600 font-bold text-sm lg:text-base border-r border-transparent px-1">
              {product.diameter || '-'}
            </div>

            {/* 3. Length (Horizontal only) */}
            {isHorizontal && (
              <div className="text-red-600 font-bold text-sm lg:text-base border-r border-transparent px-1">
                {product.length}
              </div>
            )}

            {/* 4. Height */}
            <div className="text-red-600 font-bold text-sm lg:text-base border-r border-transparent px-1">
              {product.height || '-'}
            </div>

            {/* 5. Price */}
            <div className="text-red-600 font-black text-sm lg:text-lg px-1">
              ${product.price}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
