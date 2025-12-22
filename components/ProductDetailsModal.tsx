import React, { useEffect, useState } from 'react'
import { addReview, getReviewsForProduct } from '../services/reviewService'
import { Product, ProductVariant, Review } from '../types'

interface ProductDetailsModalProps {
  product: Product | null
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
  const displayImage =
    selectedVariant && selectedVariant.image
      ? selectedVariant.image
      : product.image

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200">
        {/* <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-slate-100 rounded-full z-10 transition-colors"
        >
          <X size={24} className="text-slate-500" />
        </button> */}

        {/* Product Image Side */}
        <div className="md:w-100 bg-slate-50 flex items-center justify-center p-8 relative">
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-auto max-h-[500px] object-contain drop-shadow-xl mix-blend-multiply transition-all duration-300"
          />
          <div className="absolute bottom-4 left-10 md:left-20 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-600 shadow-sm border border-slate-200 uppercase tracking-wide">
            {product.category}
          </div>
        </div>

        <div className="p-8 overflow-y-auto bg-white flex gap-4">
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
          {/* Variant Selector */}
          {/* {product.variants && product.variants.length > 0 && (
                    <div className="mb-6">
                        <p className="text-sm font-bold text-slate-700 mb-2">Select Type:</p>
                        <div className="flex flex-wrap gap-2">
                            {product.variants.map((variant) => (
                                <button
                                    key={variant.id}
                                    onClick={() => setSelectedVariant(variant)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-2 ${
                                        selectedVariant?.id === variant.id
                                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                                            : 'border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    {variant.name}
                                    {selectedVariant?.id === variant.id && <Check size={14} />}
                                </button>
                            ))}
                        </div>
                    </div>
                )} */}

          {/* <button
              onClick={() => onAddToCart(product, selectedVariant || undefined)}
              className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} /> Add to Cart
            </button> */}

          {/* <hr className="border-slate-100 my-8" /> */}
        </div>

        {/* Content Side */}
      </div>
    </div>
  )
}

export default ProductDetailsModal
