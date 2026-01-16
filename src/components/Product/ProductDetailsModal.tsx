import React, { useState } from 'react'
import { ProductList, ProductVariant } from '../../types'
import ProductImageGallery from './ProductImageGallery'

interface ProductDetailsModalProps {
  product: ProductList | null
  onClose: () => void
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  )

  if (!product) return null

  // Determine display values
  const displayPrice = selectedVariant ? selectedVariant.price : product.price
  const displayImage = product.image

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-75 overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200">
        {/* Product Details */}
        <div className="max-w-7xl max-h-[90vh] mx-auto p-2 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 lg:gap-12">
            {/* Product Images */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ">
              <ProductImageGallery
                images={displayImage}
                name={product.name}
                defaultImage=""
              />
            </div>

            <div className="overflow-y-auto bg-white flex gap-4">
              <div className="mb-6">
                <h2 className="sm:text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  {product.name}
                </h2>
                <div className="flex items-center gap-2 mb-4">
                  {product.volume && (
                    <>
                      <span className="text-slate-500 text-sm font-medium">
                        {product.volume}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <p className="sm:text-xl md:text-2xl font-bold text-primary-600 mb-2">
                  ${displayPrice.toFixed(2)}
                </p>
                <p className="text-slate-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailsModal
