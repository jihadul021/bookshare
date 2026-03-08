import { useState } from 'react'

function Navbar({onLogoClick}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo */}
            <div className="cursor-pointer" onClick={onLogoClick}>
              <span className="text-2xl font-extrabold text-gray-900">
                Book<span className="text-orange-500">Share</span>
              </span>
            </div>

            {/* Search Bar */}
            <div className="hidden lg:block flex-1 max-w-md mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-100 text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
                <svg className="absolute right-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">How it works</a>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Browse</a>
              
              {/* Favorites */}
              <button className="text-gray-600 hover:text-red-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>

              {/* Cart */}
              <button className="text-gray-600 hover:text-orange-500 transition-colors relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 8m10 0l2 8m-12 0h12" />
                </svg>
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-orange-500 rounded-full">0</span>
              </button>

              <div className="w-px h-6 bg-gray-300"></div>
              <button className="bg-orange-500 text-white px-6 py-2.5 rounded-full font-medium hover:bg-orange-600 transition-colors">
                Log in
              </button>
            </div>

            {/* Mobile Hamburger */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 font-medium"
              >
                {isMobileMenuOpen ? 'Close' : 'Menu'}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-3 pb-4 space-y-3 shadow-lg w-full">
            {/* Mobile Search */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-4 py-2.5 bg-gray-100 text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
              <svg className="absolute right-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <a href="#" className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-md font-medium">How it works</a>
            <a href="#" className="block px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-md font-medium">Browse</a>
            <div className="border-b border-gray-200 my-2"></div>
            {/* Mobile Icons */}
            <div className="flex gap-4 py-2">
              <button className="text-gray-600 hover:text-red-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button className="text-gray-600 hover:text-orange-500 transition-colors relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 8m10 0l2 8m-12 0h12" />
                </svg>
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-orange-500 rounded-full">0</span>
              </button>
            </div>
            <button className="w-full bg-orange-500 text-white px-5 py-3 rounded-lg font-medium hover:bg-orange-600">
              Log in
            </button>
          </div>
        )}
      </nav>
  )
}

export default Navbar