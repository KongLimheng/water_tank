import type { Category } from '@prisma/client'
import { Camera, Upload, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useCategoryMutations } from '../hooks/useCategoryMutations'

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
}> = ({ isOpen, onClose, category }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>()

  const { addCategory, updateCategory, isSaving } = useCategoryMutations()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      // Reset Image State
      setSelectedFile(null)

      if (category) {
        reset({
          name: category.name,
          displayName: category.displayName || '',
          brand: category.brand as any,
        })
        // Set existing image preview
        setPreviewUrl(category.image || null)
      } else {
        reset({ name: '', displayName: '', brand: 'Grown' })
        setPreviewUrl(null)
      }
    }
  }, [isOpen, category, reset])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }
  const onSubmit: SubmitHandler<CategoryFormValues> = (data) => {
    // 3. Construct FormData
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('displayName', data.displayName || '')
    formData.append('brand', data.brand)
    formData.append('uploadType', 'categories')

    if (selectedFile) {
      formData.append('image', selectedFile)
    }

    const options = {
      onSuccess: () => {
        onClose()
      },
    }

    if (category) {
      formData.append('id', category.id.toString())
      updateCategory(formData, options)
    } else {
      addCategory(formData, options)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
          {/* Header */}
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

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 space-y-5 overflow-y-auto"
          >
            {/* Image Upload Section */}
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="size-24 rounded-full border-2 border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="size-full object-fill"
                      loading="lazy"
                    />
                  ) : (
                    <Camera className="text-slate-300" size={32} />
                  )}
                </div>

                {/* Overlay Button */}
                <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity text-white text-xs font-bold">
                  <Upload size={16} className="mr-1" /> Change
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category Name
              </label>
              <input
                {...register('name', { required: 'System name is required' })}
                disabled={!!category}
                className={`w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none ${
                  category
                    ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                    : ''
                }`}
                placeholder="e.g. water_bottles"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
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
                <option value="no">No Brand</option>
                <option value="grown">Grown</option>
                <option value="diamond">Diamond</option>
              </select>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 disabled:opacity-70 flex items-center gap-2 transition"
              >
                {isSaving ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
    // <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
    //   <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
    //     <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
    //       <h3 className="font-bold text-lg text-slate-800">
    //         {category ? 'Edit Category' : 'New Category'}
    //       </h3>
    //       <button
    //         onClick={onClose}
    //         className="p-2 hover:bg-slate-200 rounded-full transition"
    //       >
    //         <X size={20} className="text-slate-500" />
    //       </button>
    //     </div>
    //     <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
    //       <div>
    //         <label className="block text-sm font-medium text-slate-700 mb-1">
    //           System Name (ID)
    //         </label>
    //         <input
    //           {...register('name', { required: 'System name is required' })}
    //           disabled={!!category}
    //           className={`w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none ${
    //             category ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
    //           }`}
    //           placeholder="e.g. water_bottles"
    //         />
    //         {errors.name && (
    //           <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
    //         )}
    //       </div>
    //       <div>
    //         <label className="block text-sm font-medium text-slate-700 mb-1">
    //           Display Name
    //         </label>
    //         <input
    //           {...register('displayName')}
    //           className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
    //           placeholder="e.g. Water Bottles"
    //         />
    //         {errors.displayName && (
    //           <p className="text-red-500 text-xs mt-1">
    //             {errors.displayName.message}
    //           </p>
    //         )}
    //       </div>
    //       <div>
    //         <label className="block text-sm font-medium text-slate-700 mb-1">
    //           Brand Scope
    //         </label>
    //         <select
    //           {...register('brand')}
    //           disabled={!!category}
    //           className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
    //         >
    //           <option value="grown">Grown</option>
    //           <option value="diamond">Diamond</option>
    //         </select>
    //       </div>
    //       <div className="pt-2 flex justify-end gap-2">
    //         <button
    //           type="button"
    //           onClick={onClose}
    //           className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
    //         >
    //           Cancel
    //         </button>
    //         <button
    //           type="submit"
    //           disabled={isLoading}
    //           className="px-4 py-2 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 disabled:opacity-70 flex items-center gap-2"
    //         >
    //           {isLoading ? 'Saving...' : 'Save'}
    //         </button>
    //       </div>
    //     </form>
    //   </div>
    // </div>
  )
}
