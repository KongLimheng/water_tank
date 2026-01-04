import {
  ChevronDown,
  ChevronRight,
  Droplets,
  Menu as MenuIcon,
  PlaySquare,
} from 'lucide-react'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

interface NavbarProps {
  cartCount: number
  onCartClick: () => void
}

const Navbar: React.FC<NavbarProps> = ({ cartCount, onCartClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleBrandSelect = (brand: string) => {
    setMobileMenuOpen(false)
    // Use URL params for filtering
    navigate(`/?brand=${brand}&category=all`)
  }

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
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
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {/* Home Link */}
            <Link
              to="/"
              className="text-sm font-medium transition-colors hover:text-primary-600 text-slate-600"
            >
              Home
            </Link>

            {/* Products Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary-600 py-2 text-slate-600">
                Products <ChevronDown size={14} />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 w-48 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 overflow-hidden">
                <div className="p-1">
                  <Link
                    to="/?brand=Grown&category=all"
                    className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between group/item hover:bg-slate-50 text-slate-700"
                  >
                    Grown{' '}
                    <ChevronRight
                      size={14}
                      className="opacity-0 group-hover/item:opacity-100 text-primary-400 transition-opacity"
                    />
                  </Link>
                  <Link
                    to="/?brand=Diamond&category=all"
                    className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center justify-between group/item hover:bg-slate-50 text-slate-700"
                  >
                    Diamond{' '}
                    <ChevronRight
                      size={14}
                      className="opacity-0 group-hover/item:opacity-100 text-primary-400 transition-opacity"
                    />
                  </Link>
                </div>
              </div>
            </div>

            {/* Video Guide Link */}
            <Link
              to="/videos"
              className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary-600 text-slate-600"
            >
              <PlaySquare size={16} /> Video Guide
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={onCartClick}
              className="relative p-2 text-slate-600 hover:text-primary-600 transition-colors"
            >
              {/* <ShoppingCart size={24} /> */}
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white transform translate-x-1 -translate-y-1">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              className="md:hidden p-2 text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <MenuIcon size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <div className="px-4 py-4 space-y-2">
            <div className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-2">
              Brands
            </div>
            <button
              onClick={() => handleBrandSelect('Grown')}
              className="block w-full text-left py-2 px-3 rounded-lg text-slate-700"
            >
              Grown
            </button>
            <button
              onClick={() => handleBrandSelect('Diamond')}
              className="block w-full text-left py-2 px-3 rounded-lg text-slate-700"
            >
              Diamond
            </button>

            <div className="border-t border-slate-100 my-2"></div>
            <Link
              to="/videos"
              onClick={() => setMobileMenuOpen(false)}
              className=" w-full text-left py-2 px-3 rounded-lg flex items-center gap-2 text-slate-600"
            >
              <PlaySquare size={16} /> Video Guides
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
