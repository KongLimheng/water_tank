import { Category } from '@prisma/client' // Adjust path to your types
import { ArrowRight, Image as ImageIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

interface CategoryCardProps {
  category: Category
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  // Use uploaded image or a fallback gradient if null
  const hasImage = !!category.image

  return (
    <Link
      to={`/shop?category=${category.slug}&brand=${category.brand || 'all'}`}
      className="group flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:border-primary-100 transition-all duration-300"
    >
      {/* Image Section */}
      <div className="relative h-64 w-full overflow-hidden bg-slate-50 flex items-center justify-center">
        {hasImage ? (
          <img
            src={category.image!} // Ensure this path matches your server static serve
            alt={category.name}
            className="w-100 h-full object-fill transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
            <ImageIcon size={48} opacity={0.5} />
          </div>
        )}

        {/* Brand Badge Overlay */}
        {category.brand && category.brand.toLowerCase() !== 'no' && (
          <div className="absolute top-5 left-5">
            <span
              className={`px-3 py-1 rounded-full text-[20px] font-bold uppercase tracking-wider shadow-sm ${
                category.brand.toLowerCase() === 'grown'
                  ? 'bg-green-100/70 text-green-700'
                  : 'bg-blue-100/70 text-blue-700'
              }`}
            >
              {category.brand}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
          {category.displayName || category.name}
        </h3>

        <p className="text-slate-500 text-sm line-clamp-2 mb-6 flex-1">
          Explore our premium selection of{' '}
          {category.displayName || category.name}. Perfect for home and office.
        </p>

        <div className="flex items-center text-sm font-bold text-primary-600">
          View Products
          <ArrowRight
            size={16}
            className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
          />
        </div>
      </div>
    </Link>
  )
}

export default CategoryCard
