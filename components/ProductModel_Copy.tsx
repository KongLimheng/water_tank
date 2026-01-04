import { Category } from '@prisma/client'
import { Plus, Save, X } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { SubmitHandler, useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { createProduct, updateProduct } from '../services/productService'
import { ProductList } from '../types'
import ImageDragDrop from './ImageDragDrop'

interface ProductFormValues {
  id?: number
  name: string
  description: string
  price: number
  brand: string
  categoryId: string
  volume: string
  image?: string[]
  variants: {
    name: string
    price: number
    stock: number
    image?: string
  }[]
}

interface ProductModalProps {
  isOpen: boolean
  onClose: () => void
  product?: ProductList | null
  categories: Category[]
  onSuccess: () => void
}

// Memoized form inputs to prevent unnecessary re-renders
const NameInput = memo(({ register, error }: any) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">
      Product Name
    </label>
    <input
      {...register('name', { required: 'Name is required' })}
      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
      placeholder="e.g. Premium Water"
    />
    {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
  </div>
))

NameInput.displayName = 'NameInput'

const CategorySelect = memo(({ register, error, categories, brand }: any) => {
  const filteredCategories = useMemo(
    () => categories.filter((c: Category) => c.brand === brand.toLowerCase()),
    [categories, brand]
  )

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        Category
      </label>
      <select
        {...register('categoryId', { required: 'Category is required' })}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
      >
        <option value="">Select Category</option>
        {filteredCategories.map((c: Category) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  )
})

CategorySelect.displayName = 'CategorySelect'

// Memoized variant item
const VariantItem = memo(({ register, index }: any) => (
  <div className="flex gap-2 items-start p-3 bg-slate-50 rounded-xl border border-slate-200">
    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
      <div className="col-span-2 sm:col-span-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase">
          Name
        </label>
        <input
          {...register(`variants.${index}.name`, { required: true })}
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
))

VariantItem.displayName = 'VariantItem'

export const ProductModalV2: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  product,
  categories,
  onSuccess,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    defaultValues: useMemo(
      () => ({
        brand: 'Grown',
        variants: [{ name: 'Standard', price: 0, stock: 100 }],
      }),
      []
    ),
  })

  const { fields, append } = useFieldArray({
    control,
    name: 'variants',
  })

  const watchedBrand = watch('brand')

  // Reset form when modal opens/closes or product changes
  useEffect(() => {
    if (!isOpen) return

    const resetForm = () => {
      if (product) {
        // Edit Mode
        reset({
          name: product.name,
          brand: product.brand || '',
          description: product.description || undefined,
          price: product.price,
          categoryId: product.category.id.toString(),
          volume: product.volume || undefined,
          image: product.image,
          variants:
            product.variants && product.variants.length > 0
              ? product.variants
              : [{ name: 'Standard', price: product.price, stock: 0 }],
        })
        setPreviewUrls(product.image ?? [])
      } else {
        // Add Mode
        reset({
          name: '',
          description: '',
          price: 0,
          categoryId: '',
          volume: '',
          image: [],
          variants: [{ name: 'Standard', price: 0, stock: 100 }],
        })
        setPreviewUrls([])
      }
      setSelectedFiles([])
    }

    resetForm()
  }, [isOpen, product, reset])

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [previewUrls])

  const handleFilesSelected = useCallback(
    (files: FileList | null) => {
      if (!files) return
      const MAX_FILES = 5
      const currentCount = previewUrls.length
      const availableSlots = MAX_FILES - currentCount

      const newFiles = Array.from(files)
      const filesToAdd = newFiles.slice(0, availableSlots)

      if (filesToAdd.length === 0) return

      // Create object URLs
      const newPreviews = filesToAdd.map((file) => URL.createObjectURL(file))

      setSelectedFiles((prev) => [...prev, ...filesToAdd])
      setPreviewUrls((prev) => [...prev, ...newPreviews])

      if (newFiles.length > availableSlots) {
        console.log(
          `Only ${availableSlots} files were added. Maximum ${MAX_FILES} allowed.`
        )
      }
    },
    [previewUrls.length]
  )

  const removeImage = useCallback(
    (index: number) => {
      const urlToRemove = previewUrls[index]
      const isNewFile = urlToRemove.startsWith('blob:')

      setPreviewUrls((prev) => {
        const newUrls = [...prev]
        newUrls.splice(index, 1)
        return newUrls
      })

      if (isNewFile) {
        URL.revokeObjectURL(urlToRemove)

        setSelectedFiles((prev) => {
          // Find the corresponding file index
          let fileIndex = 0
          for (let i = 0; i < index; i++) {
            if (previewUrls[i].startsWith('blob:')) {
              fileIndex++
            }
          }

          const newFiles = [...prev]
          newFiles.splice(fileIndex, 1)
          return newFiles
        })
      }
    },
    [previewUrls]
  )

  const onSubmit: SubmitHandler<ProductFormValues> = useCallback(
    async (data) => {
      setIsLoading(true)

      try {
        const formData = new FormData()
        formData.append('name', data.name)
        formData.append('description', data.description || '')

        // Calculate min price from variants
        let finalPrice = Number(data.price)
        if (data.variants && data.variants.length > 0) {
          const vPrices = data.variants
            .map((v) => Number(v.price))
            .filter((p) => p > 0)
          if (vPrices.length > 0) {
            finalPrice = Math.min(...vPrices)
          }
        }
        formData.append('price', String(finalPrice))

        formData.append('brand', data.brand)
        formData.append('volume', data.volume || '')

        // Category Logic
        const catId = data.categoryId
        if (catId) {
          const cat = categories.find((c) => c.id === Number(catId))
          if (cat) {
            formData.append('categoryName', cat.name)
          }
        }
        formData.append('categoryId', String(catId))

        // Add files
        selectedFiles.forEach((file) => formData.append('images', file))

        // Keep existing images for edit
        if (product) {
          formData.append('id', String(product.id))
          const keptImages = previewUrls.filter(
            (url) => !url.startsWith('blob:')
          )
          formData.append('existingGallery', JSON.stringify(keptImages))
        }

        formData.append('variants', JSON.stringify(data.variants))

        if (product) {
          await updateProduct(formData)
          toast.success('Product updated')
        } else {
          await createProduct(formData)
          toast.success('Product created')
        }

        onSuccess()
        onClose()
      } catch (error) {
        console.error('Error saving product:', error)
        toast.error('Failed to save product')
      } finally {
        setIsLoading(false)
      }
    },
    [categories, selectedFiles, product, previewUrls, onSuccess, onClose]
  )

  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  const handleAppendVariant = useCallback(() => {
    append({ name: '', price: 0, stock: 0 })
  }, [append])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-bold text-slate-900">
            {product ? 'Edit Product' : 'New Product'}
          </h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-200 rounded-full transition"
            aria-label="Close modal"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto p-6 space-y-6"
          noValidate
        >
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <NameInput register={register} error={errors.name} />

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Subtitle
                </label>
                <input
                  {...register('volume')}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
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
              </div>

              <CategorySelect
                register={register}
                error={errors.categoryId}
                categories={categories}
                brand={watchedBrand}
              />

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
                  onClick={handleAppendVariant}
                  className="text-xs font-bold text-primary-600 flex items-center gap-1 hover:underline"
                >
                  <Plus size={14} /> Add Variant
                </button>
              )}
            </div>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <VariantItem key={field.id} register={register} index={index} />
              ))}
            </div>
          </div>
        </form>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition flex items-center gap-2 disabled:opacity-70"
            onClick={handleSubmit(onSubmit)}
          >
            {isLoading ? (
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
