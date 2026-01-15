import { useBrandMutations } from '@/src/hooks/useBrandMutations'
import { Brand, getBrands } from '@/src/services/brandService'
import { CategoryList } from '@/src/types'
import { useQuery } from '@tanstack/react-query'
import {
  Edit,
  Image as ImageIcon,
  Layers,
  Plus,
  Tag,
  Trash2,
} from 'lucide-react'
import React, { useState } from 'react'
import { useCategoryMutations } from '../../hooks/useCategoryMutations'
import { getCategories } from '../../services/categoryService'
import { BrandModal } from '../BrandModal'
import { CategoryModal } from '../Category/CategoryModel'
import { ConfirmModal } from '../ConfirmModal'

export const CategoryView: React.FC = () => {
  // --- TABS STATE ---
  const [activeTab, setActiveTab] = useState<'categories' | 'brands'>(
    'categories'
  )

  // --- MODAL STATES ---
  const [isCatModalOpen, setIsCatModalOpen] = useState(false)
  const [editingCat, setEditingCat] = useState<CategoryList | null>(null)

  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)

  const [deleteData, setDeleteData] = useState<{
    id: number
    type: 'category' | 'brand'
  } | null>(null)

  // --- DATA FETCHING ---
  const { data: categories = [], isLoading: catsLoading } = useQuery({
    queryKey: ['categories', 'all'],
    queryFn: getCategories,
  })

  const { data: brands = [], isLoading: brandsLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: getBrands,
  })

  // --- MUTATIONS ---
  const { deleteCategory } = useCategoryMutations()
  const { deleteBrand } = useBrandMutations()

  // --- HANDLERS ---
  const handleOpenCat = (c: CategoryList | null) => {
    setEditingCat(c)
    setIsCatModalOpen(true)
  }
  const handleOpenBrand = (b: Brand | null) => {
    setEditingBrand(b)
    setIsBrandModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!deleteData) return
    if (deleteData.type === 'category') deleteCategory(deleteData.id)
    if (deleteData.type === 'brand') deleteBrand(deleteData.id)
    setDeleteData(null)
  }

  // Helper for brand badge colors (dynamic fallback)
  const getBadgeColor = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes('grown'))
      return 'bg-green-100 text-green-700 border-green-200'
    if (n.includes('diamond'))
      return 'bg-blue-100 text-blue-700 border-blue-200'
    return 'bg-slate-100 text-slate-700 border-slate-200'
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* --- HEADER & TABS --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Metadata Management
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Manage your product categories and brand definitions.
          </p>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 bg-slate-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === 'categories'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Layers size={16} /> Categories
            </button>
            <button
              onClick={() => setActiveTab('brands')}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === 'brands'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Tag size={16} /> Brands
            </button>
          </div>
        </div>

        {/* Action Button Changes based on Active Tab */}
        <button
          onClick={() =>
            activeTab === 'categories'
              ? handleOpenCat(null)
              : handleOpenBrand(null)
          }
          className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-200 font-bold active:scale-95"
        >
          <Plus size={20} /> New{' '}
          {activeTab === 'categories' ? 'Category' : 'Brand'}
        </button>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4 w-20">Image</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Slug</th>
                {activeTab === 'categories' && (
                  <th className="px-6 py-4">Brand Scope</th>
                )}
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* --- CATEGORIES VIEW --- */}
              {activeTab === 'categories' &&
                categories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="hover:bg-slate-50/50 group transition"
                  >
                    <td className="px-6 py-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border flex items-center justify-center overflow-hidden">
                        {cat.image ? (
                          <img
                            src={cat.image}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon size={16} className="text-slate-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {cat.displayName || cat.name}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                      {cat.name}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase border ${getBadgeColor(
                          cat.brand?.name || ''
                        )}`}
                      >
                        {cat.brand?.name || 'Global'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ActionButtons
                        onEdit={() => handleOpenCat(cat)}
                        onDelete={() =>
                          setDeleteData({ id: cat.id, type: 'category' })
                        }
                      />
                    </td>
                  </tr>
                ))}

              {/* --- BRANDS VIEW --- */}
              {activeTab === 'brands' &&
                brands.map((brand) => (
                  <tr
                    key={brand.id}
                    className="hover:bg-slate-50/50 group transition"
                  >
                    <td className="px-6 py-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border flex items-center justify-center overflow-hidden">
                        {brand.image ? (
                          <img
                            src={brand.image}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Tag size={16} className="text-slate-300" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {brand.name}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                      {brand.slug}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ActionButtons
                        onEdit={() => handleOpenBrand(brand)}
                        onDelete={() =>
                          setDeleteData({ id: brand.id, type: 'brand' })
                        }
                      />
                    </td>
                  </tr>
                ))}

              {/* Loading States */}
              {((activeTab === 'categories' && catsLoading) ||
                (activeTab === 'brands' && brandsLoading)) && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CategoryModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        category={editingCat}
        brands={brands}
      />

      <BrandModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        brand={editingBrand}
      />

      <ConfirmModal
        isOpen={!!deleteData}
        onClose={() => setDeleteData(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${
          deleteData?.type === 'category' ? 'Category' : 'Brand'
        }?`}
        message="This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  )
}

// Helper Sub-component for buttons
const ActionButtons = ({
  onEdit,
  onDelete,
}: {
  onEdit: () => void
  onDelete: () => void
}) => (
  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
    <button
      onClick={onEdit}
      className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
    >
      <Edit size={16} />
    </button>
    <button
      onClick={onDelete}
      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
    >
      <Trash2 size={16} />
    </button>
  </div>
)
