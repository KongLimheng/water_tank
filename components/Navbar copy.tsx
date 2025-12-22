import { Droplets, Menu, ShoppingCart } from 'lucide-react'
import React, { useState } from 'react'

interface NavbarProps {
  cartCount: number
  onCartClick: () => void
  activeCategory: string
  onCategoryChange: (cat: string) => void
}

const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onCartClick,
  activeCategory,
  onCategoryChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false)

  const handleHomeClick = () => {
    onCategoryChange('all')
  }
  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onCategoryChange('all')}
          >
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-primary-200 shadow-lg">
              <Droplets className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                H2O<span className="text-primary-600">Premium</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">
                Pure Water Delivery
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {/* {['all', 'bottles', 'dispensers', 'accessories'].map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`text-sm font-medium transition-colors hover:text-primary-600 capitalize ${
                  activeCategory === cat ? 'text-primary-600' : 'text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))} */}

            {/* Home Link */}
            <button
              onClick={handleHomeClick}
              className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                currentView === 'shop' &&
                activeBrand === 'all' &&
                activeCategory === 'all'
                  ? 'text-primary-600'
                  : 'text-slate-600'
              }`}
            >
              Home
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={onCartClick}
              className="relative p-2 text-slate-600 hover:text-primary-600 transition-colors"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white transform translate-x-1 -translate-y-1">
                  {cartCount}
                </span>
              )}
            </button>
            <button className="md:hidden p-2 text-slate-600">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
