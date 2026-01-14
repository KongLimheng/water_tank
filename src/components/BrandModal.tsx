import { Save, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useBrandMutations } from '../hooks/useBrandMutations'
import { Brand } from '../services/brandService'

export const BrandModal = ({
  isOpen,
  onClose,
  brand,
}: {
  isOpen: boolean
  onClose: () => void
  brand?: Brand | null
}) => {
  const { addBrand, updateBrand } = useBrandMutations()
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)

  const { register, handleSubmit, reset } = useForm<{ name: string }>()

  useEffect(() => {
    if (isOpen) {
      reset({ name: brand?.name || '' })
      setPreview(brand?.image || null)
      setFile(null)
    }
  }, [isOpen, brand, reset])

  const onSubmit = (data: Brand) => {
    if (brand) {
      updateBrand(data, { onSuccess: onClose })
    } else {
      addBrand(data, { onSuccess: onClose })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800">
            {brand ? 'Edit Brand' : 'New Brand'}
          </h3>
          <button onClick={onClose}>
            <X size={20} className="text-slate-400 hover:text-slate-600" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Brand Name
            </label>
            <input
              {...register('name', { required: true })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g. Grown"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 flex items-center justify-center gap-2"
          >
            <Save size={18} /> Save Brand
          </button>
        </form>
      </div>
    </div>
  )
}
