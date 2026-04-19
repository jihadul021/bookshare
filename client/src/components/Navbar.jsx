import { useState, useEffect } from 'react'
import api from '../api'
import { getUnreadCount } from '../api'
import { connectSocket, getSocket } from '../socket'

function Navbar({
  onLogoClick,
  onBrowseClick,
  onLoginClick,
  onRegisterClick,
  onLogoutClick,
  onMyProfileClick,
  onCartClick,
  onWishlistClick,
  onChatClick,
  onSearch,
  isLoggedIn,
  userName,
  profilePicture,
  token
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDesktopProfileOpen, setIsDesktopProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const profileInitial = userName?.trim()?.charAt(0)?.toUpperCase() || 'U'
  const hasProfilePicture =
    Boolean(profilePicture?.trim()) && !profilePicture.includes('google.com/url?')

  useEffect(() => {
    if (token) {
      fetchCounts()
      fetchUnreadCount()
    }
  }, [token])

  useEffect(() => {
    if (!token) {
      return undefined
    }

    const storedUser = JSON.parse(localStorage.getItem('bookshareUser') || 'null')
    if (!storedUser?._id) {
      return undefined
    }

    const socket = connectSocket(storedUser._id) || getSocket()
    if (!socket) {
      return undefined
    }

    const handleRealtimeUpdate = () => {
      fetchUnreadCount()
      fetchCounts()
    }

    socket.on('receive-message', handleRealtimeUpdate)
    socket.on('message-read', handleRealtimeUpdate)
    socket.on('message-sent', handleRealtimeUpdate)

    return () => {
      socket.off('receive-message', handleRealtimeUpdate)
      socket.off('message-read', handleRealtimeUpdate)
      socket.off('message-sent', handleRealtimeUpdate)
    }
  }, [token])

  const fetchCounts = async () => {
    try {
      const [cartRes, wishlistRes] = await Promise.all([
        api.get('/api/cart', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/api/wishlist', { headers: { Authorization: `Bearer ${token}` } })
      ])
      setCartCount(cartRes.data.items?.length || 0)
      setWishlistCount(wishlistRes.data.books?.length || 0)
    } catch (err) {
      console.error('Failed to fetch counts:', err)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadCount()
      setUnreadMessages(response.data.unreadCount || 0)
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
    }
  }
  
  const handleMobileAction = (action) => {
    action?.()
    setIsMobileMenuOpen(false)
  }

  const handleDesktopProfileAction = (action) => {
    action?.()
    setIsDesktopProfileOpen(false)
  }

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      onSearch?.(searchQuery)
      setSearchQuery('')
    }
  }

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
                  onKeyPress={handleSearchSubmit}
                  className="w-full px-4 py-2.5 bg-gray-100 text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
                <button
                  onClick={handleSearchSubmit}
                  className="absolute right-3 top-3 w-5 h-5 text-gray-400 hover:text-gray-600 bg-none border-none cursor-pointer"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <button onClick={onBrowseClick} className="text-gray-600 hover:text-gray-900 font-medium">
                How it works
              </button>
              <button onClick={onBrowseClick} className="text-gray-600 hover:text-gray-900 font-medium">
                Browse
              </button>
              
              {/* Favorites */}
              <button onClick={onWishlistClick} className="text-gray-600 hover:text-red-500 transition-colors relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button onClick={onCartClick} className="text-gray-600 hover:text-orange-500 transition-colors relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 8m10 0l2 8m-12 0h12" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-orange-500 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Messages */}
              <button onClick={onChatClick} className="text-gray-600 hover:text-blue-500 transition-colors relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {unreadMessages > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-blue-500 rounded-full">
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </span>
                )}
              </button>

              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setIsDesktopProfileOpen((prev) => !prev)}
                    className="focus:outline-none"
                  >
                    {hasProfilePicture ? (
                      <img
                        src={profilePicture}
                        alt="Profile"
                        className="w-9 h-9 rounded-full border border-orange-200 object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full border border-orange-200 bg-orange-50 text-orange-700 font-bold text-sm flex items-center justify-center">
                        {profileInitial}
                      </div>
                    )}
                  </button>

                  {isDesktopProfileOpen && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50">
                      <button
                        onClick={() => handleDesktopProfileAction(onMyProfileClick)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        My Profile
                      </button>
                      <button
                        onClick={() => handleDesktopProfileAction(onLogoutClick)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="w-px h-6 bg-gray-300"></div>
                  <button
                    onClick={onRegisterClick}
                    className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
                  >
                    Sign up
                  </button>
                  <button
                    onClick={onLoginClick}
                    className="bg-orange-500 text-white px-6 py-2.5 rounded-full font-medium hover:bg-orange-600 transition-colors"
                  >
                    Log in
                  </button>
                </>
              )}
            </div>

            {/* Mobile Top Actions */}
            <div className="md:hidden flex items-center gap-3">
              <button onClick={onWishlistClick} className="text-gray-600 hover:text-red-500 transition-colors relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                    {wishlistCount}
                  </span>
                )}
              </button>
              <button onClick={onCartClick} className="text-gray-600 hover:text-orange-500 transition-colors relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 8m10 0l2 8m-12 0h12" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-orange-500 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
              {isLoggedIn ? (
                <button
                  onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                  className="focus:outline-none"
                >
                  {hasProfilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="w-8 h-8 rounded-full border border-orange-200 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full border border-orange-200 bg-orange-50 text-orange-700 font-bold text-xs flex items-center justify-center">
                      {profileInitial}
                    </div>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                  className="text-gray-700 font-medium"
                >
                  {isMobileMenuOpen ? 'Close' : 'Menu'}
                </button>
              )}
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchSubmit}
                className="w-full px-4 py-2.5 bg-gray-100 text-gray-900 placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
              />
              <button
                onClick={handleSearchSubmit}
                className="absolute right-3 top-3 w-5 h-5 text-gray-400 hover:text-gray-600 bg-none border-none cursor-pointer"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => handleMobileAction(onMyProfileClick)}
                  className="w-full border border-gray-200 text-gray-700 px-5 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors mb-2"
                >
                  My Profile
                </button>
                <div className="border-b border-gray-200 my-2"></div>
                <button
                  onClick={() => handleMobileAction(onBrowseClick)}
                  className="w-full text-left px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-md font-medium"
                >
                  How it works
                </button>
                <button
                  onClick={() => handleMobileAction(onBrowseClick)}
                  className="w-full text-left px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-md font-medium"
                >
                  Browse
                </button>
                <button
                  onClick={() => handleMobileAction(onWishlistClick)}
                  className="w-full text-left px-3 py-2 text-gray-700 hover:text-red-500 hover:bg-red-50 rounded-md font-medium flex items-center gap-2"
                >
                  Wishlist {wishlistCount > 0 && <span className="ml-auto bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">{wishlistCount}</span>}
                </button>
                <button
                  onClick={() => handleMobileAction(onCartClick)}
                  className="w-full text-left px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-md font-medium flex items-center gap-2"
                >
                  Cart {cartCount > 0 && <span className="ml-auto bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">{cartCount}</span>}
                </button>
                <button
                  onClick={() => handleMobileAction(onChatClick)}
                  className="w-full text-left px-3 py-2 text-gray-700 hover:text-blue-500 hover:bg-blue-50 rounded-md font-medium flex items-center gap-2"
                >
                  Messages {unreadMessages > 0 && <span className="ml-auto bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">{unreadMessages > 99 ? '99+' : unreadMessages}</span>}
                </button>
                <div className="border-b border-gray-200 my-2"></div>
                <button
                  onClick={() => handleMobileAction(onLogoutClick)}
                  className="w-full bg-gray-900 text-white px-5 py-3 rounded-lg font-medium hover:bg-black transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleMobileAction(onBrowseClick)}
                  className="w-full text-left px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-md font-medium"
                >
                  How it works
                </button>
                <button
                  onClick={() => handleMobileAction(onBrowseClick)}
                  className="w-full text-left px-3 py-2 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-md font-medium"
                >
                  Browse
                </button>
                <div className="border-b border-gray-200 my-2"></div>
                <button
                  onClick={() => handleMobileAction(onRegisterClick)}
                  className="w-full border border-orange-200 text-orange-600 px-5 py-3 rounded-lg font-medium hover:bg-orange-50 transition-colors mb-2"
                >
                  Sign up
                </button>
                <button
                  onClick={() => handleMobileAction(onLoginClick)}
                  className="w-full bg-orange-500 text-white px-5 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Log in
                </button>
              </>
            )}
          </div>
        )}
      </nav>
  )
}

export default Navbar
