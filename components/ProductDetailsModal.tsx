import React, { useEffect, useState } from 'react'
import { addReview, getReviewsForProduct } from '../services/reviewService'
import { Product, ProductList, ProductVariant, Review } from '../types'
import ProductImageGallery from './ProductImageGallery'

interface ProductDetailsModalProps {
  product: ProductList | null
  onClose: () => void
  onAddToCart: (product: Product, variant?: ProductVariant) => void
}

const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onAddToCart,
}) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [newReview, setNewReview] = useState({
    author: '',
    rating: 5,
    text: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  )

  useEffect(() => {
    if (product) {
      setReviews(getReviewsForProduct(product.id))
      setNewReview({ author: '', rating: 5, text: '' })
      // Select first variant by default if exists
      if (product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0])
      } else {
        setSelectedVariant(null)
      }
    }
  }, [product])

  if (!product) return null

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newReview.author.trim() || !newReview.text.trim()) return

    setIsSubmitting(true)
    const added = addReview(product.id, newReview)
    setReviews((prev) => [added, ...prev])
    setNewReview({ author: '', rating: 5, text: '' })
    setIsSubmitting(false)
  }

  const averageRating = reviews.length
    ? (
        reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
      ).toFixed(1)
    : null

  // Determine display values
  const displayPrice = selectedVariant ? selectedVariant.price : product.price
  const displayImage = product.image

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-75 overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200">
        {/* Product Image Side */}
        {/* <div className="md:w-100 bg-slate-50 flex items-center justify-center p-8 relative">
          <img
            src={displayImage[0]}
            alt={product.name}
            className="w-full h-auto max-h-[500px] object-contain drop-shadow-xl mix-blend-multiply transition-all duration-300"
          />
          <div className="absolute bottom-4 left-10 md:left-20 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-600 shadow-sm border border-slate-200 uppercase tracking-wide">
            {product.category.name}
          </div>
        </div> */}

        {/* Product Details */}
        <div className="max-w-7xl max-h-[90vh] mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
