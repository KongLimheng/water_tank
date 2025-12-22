import React, { useState } from 'react'
import { Product } from '../types'

interface ProductCardProps {
  product: Product
  onAdd: (product: Product) => void
  onClick: (product: Product) => void
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAdd,
  onClick,
}) => {
  const [displayImage, setDisplayImage] = useState(product.image)

  // Filter variants that have images
  const visualVariants = product.variants?.filter(
    (v) => v.image && v.image !== product.image
  )

  return (
    <div
      className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary-100 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
      onClick={() => onClick(product)}
      onMouseLeave={() => setDisplayImage(product.image)} // Reset on mouse leave
    >
      <div className="relative h-64 overflow-hidden bg-slate-50">
        <img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full text-slate-800 shadow-sm capitalize">
            {product.category}
          </span>
        </div>

        {/* Swatches */}
        {visualVariants && visualVariants.length > 0 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <div
              className={`w-3 h-3 rounded-full border border-white shadow-sm cursor-pointer ${
                displayImage === product.image
                  ? 'ring-2 ring-primary-500 scale-125'
                  : 'bg-slate-300'
              }`}
              style={{
                backgroundImage: `url(${product.image})`,
                backgroundSize: 'cover',
              }}
              onMouseEnter={(e) => {
                e.stopPropagation()
                setDisplayImage(product.image)
              }}
            />
            {visualVariants.map((variant) => (
              <div
                key={variant.id}
                className={`w-3 h-3 rounded-full border border-white shadow-sm cursor-pointer bg-slate-200 ${
                  displayImage === variant.image
                    ? 'ring-2 ring-primary-500 scale-125'
                    : ''
                }`}
                style={{
                  backgroundImage: `url(${variant.image})`,
                  backgroundSize: 'cover',
                }}
                onMouseEnter={(e) => {
                  e.stopPropagation()
                  setDisplayImage(variant.image!)
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1 group-hover:text-primary-600 transition-colors">
              {product.name}
            </h3>
            {product.volume && (
              <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                {product.volume}
              </span>
            )}
          </div>
          <p className="text-lg font-bold text-primary-600">
            ${product.price.toFixed(2)}
          </p>
        </div>

        <p className="text-slate-500 text-sm mb-6 flex-1 line-clamp-2">
          {product.description}
        </p>

        {/* <button 
          onClick={(e) => {
            e.stopPropagation();
            onAdd(product);
          }}
          className="w-full py-3 bg-slate-50 text-slate-900 font-semibold rounded-xl flex items-center justify-center gap-2 group-hover:bg-primary-600 group-hover:text-white transition-all active:scale-95"
        >
          <Plus size={18} />
          Add to Cart
        </button> */}
      </div>
    </div>
  )
}

export default ProductCard
