import { useQuery } from '@tanstack/react-query'
import { Edit, Loader2, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useProductMutations } from '../../hooks/useProductMutations'
import { getCategories } from '../../services/categoryService'
import { ProductList } from '../../types'
import { generatePlaceholderImage } from '../../utils/placeholderImage'
import { ProductModal } from '../ProductModel'

interface ProductViewProp {
  products: ProductList[]
}

export const ProductView = ({ products }: ProductViewProp) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductList | null>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const { deleteProduct } = useProductMutations()

  // Load categories only when opening the modal to save performance
  const handleOpenModal = async (product: ProductList | null = null) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', 'all'], // Cache key
    queryFn: () => getCategories(),
    staleTime: 1000 * 60 * 10, // Keep categories fresh for 10 minutes
  })

  const handleDelete = (id: number) => {
    if (window.confirm('Delete this product?')) {
      setDeletingId(id)
      deleteProduct(id, {
        onSettled: () => setDeletingId(null),
      })
    }
  }

  return (
    <>
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Product Management
            </h2>
            <p className="text-slate-500 text-sm">
              Manage your catalog and stock.
            </p>
          </div>
          <button
            onClick={() => handleOpenModal(null)}
            className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl hover:bg-primary-700 transition font-medium"
          >
            <Plus size={20} /> Add Product
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Product Details</th>
                  <th className="px-6 py-4">Brand</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50/50 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={
                            product.image[0] ||
                            generatePlaceholderImage(product.name)
                          }
                          loading="lazy"
                          onLoad={() => setImageLoaded(true)}
                          className="w-12 h-12 rounded-lg object-cover bg-slate-100"
                          alt={product.slug}
                        />
                        <div>
                          <div className="font-bold text-slate-800 text-sm">
                            {product.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {product.volume || 'Standard'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold capitalize bg-orange-50 text-orange-700 border border-orange-100">
                        {product.category.brand}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold capitalize bg-orange-50 text-orange-700 border border-orange-100">
                        {product.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-700">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="p-2 text-slate-400 hover:text-primary-600"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deletingId === product.id}
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === product.id ? (
                            <Loader2
                              size={16}
                              className="animate-spin text-red-600"
                            />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {products.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-slate-400"
                    >
                      No products found. Click "Add Product" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        product={editingProduct}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
      />
    </>
  )
}
