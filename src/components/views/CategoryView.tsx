import type { Category } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'
import { Edit, Plus, Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import { useCategoryMutations } from '../../hooks/useCategoryMutations'
import { getCategories } from '../../services/categoryService'
import { CategoryModal } from '../CategoryModel'

export const CategoryView: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories', 'all-tab'], // Cache key
    queryFn: getCategories,
  })

  const { deleteCategory, isDeleting } = useCategoryMutations()

  const handleOpenModal = (category: Category | null = null) => {
    setEditingCategory(category)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategory(id)
    }
  }

  // Helper for Brand Badge Styles
  const getBrandBadgeStyles = (brand: string) => {
    switch (brand) {
      case 'Grown':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'Diamond':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Categories</h2>
            <p className="text-slate-500 text-sm">
              Organize products into dynamic categories under specific brands.
            </p>
          </div>
          <button
            onClick={() => handleOpenModal(null)}
            className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition shadow-lg shadow-primary-200 font-medium active:scale-95"
          >
            <Plus size={20} /> Add Category
          </button>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4 font-bold">Display Name</th>
                  <th className="px-6 py-4 font-bold">Code / Slug</th>
                  <th className="px-6 py-4 font-bold">Brand</th>
                  <th className="px-6 py-4 text-right font-bold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      Loading categories...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      No categories found. Create one to get started.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr
                      key={cat.id}
                      className="hover:bg-slate-50/50 transition cursor-pointer"
                      onDoubleClick={() => handleOpenModal(cat)}
                    >
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {cat.displayName || cat.name}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-400">
                        {cat.name}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${getBrandBadgeStyles(
                            cat.brand
                          )}`}
                        >
                          {cat.brand}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(cat)}
                            className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition"
                            title="Edit Category"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            disabled={isDeleting}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Delete Category"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
        onSuccess={() => {}}
      />
    </>
  )
}
