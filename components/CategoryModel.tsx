import { Category } from '@prisma/client'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { createCategory, updateCategory } from '../services/categoryService'

interface CategoryFormValues {
  name: string
  displayName: string
  brand: string
}

export const CategoryModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  category?: Category | null
  onSuccess: () => void
}> = ({ isOpen, onClose, category, onSuccess }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (category) {
        reset({
          name: category.name,
          displayName: category.displayName || '',
          brand: category.brand as any,
        })
      } else {
        reset({ name: '', displayName: '', brand: 'Grown' })
      }
    }
  }, [isOpen, category, reset])

  const onSubmit: SubmitHandler<CategoryFormValues> = async (data) => {
    setIsLoading(true)
    try {
      const displayName = data.displayName || data.name
      if (category) {
        await updateCategory({ ...category, ...data, displayName })
        toast.success('Category updated')
      } else {
        await createCategory({
          name: data.name,
          displayName,
          brand: data.brand,
        })
        toast.success('Category created')
      }
      onSuccess()
      onClose()
    } catch (e) {
      toast.error('Operation failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800">
            {category ? 'Edit Category' : 'New Category'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              System Name (ID)
            </label>
            <input
              {...register('name', { required: 'System name is required' })}
              disabled={!!category}
              className={`w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none ${
                category ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
              }`}
              placeholder="e.g. water_bottles"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Display Name
            </label>
            <input
              {...register('displayName')}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g. Water Bottles"
            />
            {errors.displayName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.displayName.message}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Brand Scope
            </label>
            <select
              {...register('brand')}
              disabled={!!category}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
            >
              <option value="grown">Grown</option>
              <option value="diamond">Diamond</option>
            </select>
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 disabled:opacity-70 flex items-center gap-2"
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
