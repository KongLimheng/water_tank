import type { Category } from '@prisma/client'
import { Plus, Save, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
// import { createProduct, updateProduct } from '../services/productService'
import { useProductMutations } from '../hooks/useProductMutations'
import { ProductList } from '../types'
import ImageDragDrop from './ImageDragDrop'
interface ProductFormValues {
  id?: number
  name: string
  description: string
  price: number
  brand: string
  categoryId: string // Use string for select value
  volume: string
  image?: string[] // URL string
  type?: string
  diameter?: string
  height?: string
  group: string
  length?: string
  variants: {
    name: string
    price: number
    stock: number
    image?: string
  }[]
}

export const ProductModal: React.FC<{
  isOpen: boolean
  onClose: () => void
  product?: ProductList | null
  categories: Category[]
}> = ({ isOpen, onClose, product, categories }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  const { addProduct, isAdding, updateProduct, isUpdating } =
    useProductMutations()
  const isSaving = isAdding || isUpdating

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<ProductFormValues>({
    defaultValues: {
      brand: 'Grown',
      variants: [{ name: 'Standard', price: 0, stock: 1 }],
    },
  })

  const { fields, append } = useFieldArray({
    control,
    name: 'variants',
  })

  const watchedBrand = watch('brand')
  const watchedType = watch('type')

  const availableCategories = categories

  useEffect(() => {
    if (isOpen) {
      if (product) {
        reset({
          name: product.name,
          brand: product.brand || '',
          description: product.description || undefined,
          price: product.price,
          categoryId: product.category?.id ? String(product.category.id) : '',
          volume: product.volume || '',
          image: product.image,
          diameter: product.diameter || '',
          type: product.type,
          height: product.height,
          group: product.group,
          length: product.length || '',
          variants:
            product.variants && product.variants.length > 0
              ? product.variants
              : [{ name: 'Standard', price: product.price, stock: 0 }],
        })
        setPreviewUrls(product.image ?? [])
      } else {
        reset({
          name: '',
          description: '',
          brand: 'Grown',
          price: 0,
          volume: '',
          categoryId: '',
          image: [],
        })
        setPreviewUrls([])
      }
      setSelectedFiles([])
    }
  }, [isOpen, product, reset])

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return
    const MAX_FILES = 5
    const currentCount = previewUrls.length
    const availableSlots = MAX_FILES - currentCount

    const newFiles = Array.from(files)

    // Only take as many files as we have slots for
    const filesToAdd = newFiles.slice(0, availableSlots)
    if (filesToAdd.length > 0) {
      setSelectedFiles((prev) => [...prev, ...filesToAdd])
      const newPreviews = filesToAdd.map((f) => URL.createObjectURL(f))
      setPreviewUrls((prev) => [...prev, ...newPreviews])
    }

    // Optional: Show a toast if files were skipped
    if (newFiles.length > availableSlots) {
      console.log(
        `Only ${availableSlots} files were added. Maximum ${MAX_FILES} allowed.`
      )
    }
  }

  const removeImage = (index: number) => {
    const urlToRemove = previewUrls[index]
    const isNewFile = urlToRemove.startsWith('blob:')

    if (isNewFile) {
      const nonBlobCount = previewUrls
        .slice(0, index)
        .filter((u) => !u.startsWith('blob:')).length
      const fileIndex = index - nonBlobCount
      const newFiles = [...selectedFiles]
      newFiles.splice(fileIndex, 1)
      setSelectedFiles(newFiles)
    }

    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    const formData = new FormData()
    formData.append('name', data.name)
    formData.append('description', data.description || '')

    // Calculate min price from variants if base price is 0 or inconsistent
    let finalPrice = Number(data.price)
    if (data.variants && data.variants.length > 0) {
      const vPrices = data.variants
        .map((v) => Number(v.price))
        .filter((p) => p > 0)
      if (vPrices.length > 0) finalPrice = Math.min(...vPrices)
    }
    formData.append('price', String(finalPrice))

    formData.append('brand', data.brand)
    formData.append('volume', data.volume || '')
    formData.append('height', data.height!)
    formData.append('diameter', data.diameter!)
    formData.append('type', data.type!)
    formData.append('group', data.group)
    formData.append('length', data.length || '')

    // Category Logic
    let catId = data.categoryId
    let catName = ''
    if (catId) {
      const cat = categories.find((c) => c.id === Number(catId))
      if (cat) catName = cat.name
    }
    formData.append('categoryId', String(catId))

    // Files
    selectedFiles.forEach((file) => formData.append('images', file))

    // Kept Existing Images (for edit)
    if (product) {
      formData.append('id', String(product.id))
      const keptImages = previewUrls.filter((url) => !url.startsWith('blob:'))
      formData.append('existingGallery', JSON.stringify(keptImages))
    }

    formData.append('variants', JSON.stringify(data.variants))

    const mutationOptions = {
      onSuccess: () => {
        toast.success(
          product
            ? 'Product updated successfully'
            : 'Product created successfully'
        )
        onClose()
      },
      onError: (error: any) => {
        console.error(error)
        toast.error(error.message || 'Failed to save product')
      },
    }

    if (product) {
      updateProduct(formData, mutationOptions)
    } else {
      addProduct(formData, mutationOptions)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-bold text-slate-900">
            {product ? 'Edit Product' : 'New Product'}
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
          className="flex-1 overflow-y-auto p-6 space-y-6"
        >
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('name', { required: 'Name is required' })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="e.g. Premium Water"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Volume (ចំណុះ)
                </label>
                <input
                  {...register('volume')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Brand
                </label>
                <select
                  {...register('brand')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                >
                  <option value="Grown">Grown</option>
                  <option value="Diamond">Diamond</option>
                </select>
              </div> */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category
                </label>
                <select
                  {...register('categoryId', {
                    required: 'Category is required',
                  })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                >
                  <option value="">Select Category</option>
                  {availableCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.brand})
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Group
                </label>
                <select
                  {...register('group')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                >
                  <option value="">Select Group</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Product Type{' '}
                  {watch('group') && <span className="text-red-500">*</span>}
                </label>
                <select
                  {...register('type', {
                    required: watch('group')
                      ? 'Product Type is required'
                      : false,
                    onChange: (e) => {
                      const value = e.target.value
                      if (value === 'vertical') {
                        setValue('length', '')
                        clearErrors('length')
                      }
                    },
                  })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                >
                  <option value="">Select Type</option>
                  <option value="vertical">Vertical</option>
                  <option value="horizontal">Horizontal</option>
                </select>

                {errors.type && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.type.message}
                  </p>
                )}
              </div>
              <div
                className={`grid md:grid-cols-${
                  watchedType === 'horizontal' ? '3' : '2'
                } grid-cols-1 col-span-2 gap-2`}
              >
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Diameter (ទទឹងមាត់) <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('diameter', {
                      required: 'Diameter is required',
                    })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="e.g. 0.5M"
                  />
                  {errors.diameter && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.diameter.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Height (កំពស់) <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('height', { required: 'Height is required' })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="e.g. 10M"
                  />
                  {errors.height && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.height.message}
                    </p>
                  )}
                </div>

                {watchedType === 'horizontal' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Length (បណ្ដោយ){' '}
                      {watchedType === 'horizontal' && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <input
                      {...register('length', {
                        required:
                          watchedType === 'horizontal'
                            ? 'Length is required'
                            : false,
                      })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                      placeholder="e.g. 10M"
                    />
                    {errors.length && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.length.message}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="Details..."
                />
              </div>
            </div>
          </div>

          <ImageDragDrop
            handleFilesSelected={handleFilesSelected}
            removeImage={removeImage}
            previewUrls={previewUrls}
          />

          {/* Variants */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider"></h4>
              {fields.length === 0 && (
                <button
                  type="button"
                  onClick={() => append({ name: '', price: 0, stock: 0 })}
                  className="text-xs font-bold text-primary-600 flex items-center gap-1 hover:underline"
                >
                  <Plus size={14} /> Add Variant
                </button>
              )}
            </div>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex gap-2 items-start p-3 bg-slate-50 rounded-xl border border-slate-200"
                >
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">
                        Name
                      </label>
                      <input
                        {...register(`variants.${index}.name`, {
                          required: true,
                        })}
                        className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded outline-none"
                        placeholder="e.g. 500ml"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">
                        Price
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        {...register(`variants.${index}.price`, {
                          required: true,
                          min: 0,
                        })}
                        className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
            className="px-6 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition flex items-center gap-2 disabled:opacity-70"
          >
            {isSaving ? (
              <span className="animate-spin">...</span>
            ) : (
              <>
                <Save size={18} /> Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
