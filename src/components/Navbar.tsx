import { PlaySquare } from 'lucide-react'
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Logo from '../public/logo.jpg'

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  const isActiveExact = (path: string) => location.pathname === path

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center  justify-center shadow-primary-200 shadow-lg overflow-hidden">
              <img
                src={Logo}
                className="size-full object-fill rounded-full shadow-2xl"
              />
            </div>
            <div>
              <h1 className="text-sm md:text-xl font-bold text-slate-900 tracking-tight">
                Fa De Manufacture Co., LTD.
              </h1>
              <p className="text-[10px] md:text-[14px] text-slate-500 font-medium uppercase">
                ផលិត និងផ្គត់ផ្គង់ បាសាំងទឹកអីណុក & ជ័រគ្រប់ប្រភេទ
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {/* Home Link */}
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary-600 , ${
                isActiveExact('/') ? 'text-primary-600 ' : 'text-slate-600'
              }`}
            >
              Home
            </Link>

            <Link
              to="/products"
              className={`text-sm font-medium transition-colors hover:text-primary-600  py-2 px-2 rounded-xl ${
                isActiveExact('/products') || isActiveExact('/shop')
                  ? 'text-primary-600 '
                  : 'text-slate-600'
              }`}
            >
              Product
            </Link>

            {/* Video Guide Link */}
            <Link
              to="/videos"
              className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-primary-600 ${
                isActiveExact('/videos')
                  ? 'text-primary-600 '
                  : 'text-slate-600'
              }`}
            >
              <PlaySquare size={16} /> Video Guide
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <div className="px-4 py-4 space-y-2">
            <Link
              to="/products"
              className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                isActiveExact('/products')
                  ? 'text-primary-600 '
                  : 'text-slate-600'
              }`}
            >
              Product
            </Link>

            <div className="border-t border-slate-100 my-2"></div>
            <Link
              to="/videos"
              onClick={() => setMobileMenuOpen(false)}
              className={`w-full text-left py-2 px-3 rounded-lg flex items-center gap-2 ${
                isActiveExact('/videos')
                  ? 'text-primary-600 '
                  : 'text-slate-600'
              }`}
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
